import Employer from "../models/Employer.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerEmployer = async (req, res) => {
  try {
    const { companyName, recruiterName, email, mobile, password, companyLocation, companyWebsite } = req.body;

    if (!companyName || !recruiterName || !email || !mobile || !password || !companyLocation) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const existing = await Employer.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered." });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    // 7 days expiry instead of 24 hours
    const verificationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Employer.create({
      companyName, recruiterName, email, mobile, password,
      companyLocation, companyWebsite,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/employer/verify-email/${verificationToken}`;

    console.log("Verification URL:", verifyUrl); // ← this will show in terminal

    await sendEmail({
      to: email,
      subject: "Verify your Resumewala Employer Account",
      html: `
        <h2>Welcome to Resumewala, ${recruiterName}!</h2>
        <p>Please verify your email to activate your employer account.</p>
        <a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:10px;">
          Verify Email
        </a>
        <p style="margin-top:16px;color:#666;">Link expires in 7 days.</p>
        <p>Or copy this link: ${verifyUrl}</p>
      `,
    });

    res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
  } catch (err) {
    console.error("Employer register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    console.log("Verifying token:", req.params.token); // debug

    // First find by token only (ignore expiry for now to debug)
    const employer = await Employer.findOne({
      emailVerificationToken: req.params.token,
    });

    console.log("Employer found:", employer ? employer.email : "NOT FOUND");

    if (!employer) {
      return res.status(400).json({ message: "Invalid verification link. Please register again." });
    }

    // Check expiry separately
    if (employer.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: "Verification link has expired. Please register again." });
    }

    employer.isEmailVerified = true;
    employer.emailVerificationToken = undefined;
    employer.emailVerificationExpires = undefined;
    await employer.save();

    res.json({ message: "Email verified successfully. Your account is pending admin approval." });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employer = await Employer.findOne({ email });

    if (!employer) return res.status(401).json({ message: "Invalid credentials." });
    if (!employer.isEmailVerified) return res.status(403).json({ message: "Please verify your email first." });
    if (employer.isBlocked) return res.status(403).json({ message: "Your account has been blocked. Contact support." });
    if (!employer.isApproved) return res.status(403).json({ message: "Your account is pending admin approval." });

    const isMatch = await employer.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    const token = generateToken(employer._id, "employer");

    res.json({
      token,
      employer: {
        _id: employer._id,
        companyName: employer.companyName,
        recruiterName: employer.recruiterName,
        email: employer.email,
        companyLogo: employer.companyLogo,
        isVerified: employer.isVerified,
        subscription: employer.subscription,
      },
    });
  } catch (err) {
    console.error("Employer login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const employer = await Employer.findOne({ email: req.body.email });
    if (!employer) return res.status(404).json({ message: "No account with that email." });

    const token = crypto.randomBytes(32).toString("hex");
    employer.resetPasswordToken = token;
    employer.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await employer.save();

    const resetUrl = `${process.env.FRONTEND_URL}/employer/reset-password/${token}`;
    await sendEmail({
      to: employer.email,
      subject: "Reset your Resumewala Employer Password",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Expires in 1 hour.</p>
      `,
    });

    res.json({ message: "Password reset email sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const employer = await Employer.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!employer) return res.status(400).json({ message: "Invalid or expired token." });

    employer.password = req.body.password;
    employer.resetPasswordToken = undefined;
    employer.resetPasswordExpires = undefined;
    await employer.save();

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const employer = await Employer.findById(req.employer._id).select("-password");
    if (!employer) return res.status(404).json({ message: "Not found" });
    res.json(employer);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};