import Employer from "../models/Employer.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── Helper: generate secure verification token ────────────────
const generateVerificationToken = () => crypto.randomBytes(32).toString("hex");

// ── Helper: send verification email ──────────────────────────
const sendVerificationEmail = async (employer, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/employer/verify-email/${token}`;
  await sendEmail({
    to: employer.email,
    subject: "Verify your Resumewala Employer Account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#2563eb">Welcome to Resumewala, ${employer.recruiterName}!</h2>
        <p>Please verify your email address to activate your employer account.</p>
        <a href="${verifyUrl}"
          style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;
          text-decoration:none;display:inline-block;margin-top:12px;font-weight:bold;">
          Verify Email Address
        </a>
        <p style="margin-top:16px;color:#666;font-size:13px">
          This link expires in 7 days. If you did not create an account, ignore this email.
        </p>
        <p style="color:#666;font-size:13px">Or copy this link:<br/>
          <a href="${verifyUrl}" style="color:#2563eb">${verifyUrl}</a>
        </p>
      </div>
    `,
  });
};

// ── POST /api/employer/register ───────────────────────────────
export const registerEmployer = async (req, res) => {
  try {
    const {
      companyName, recruiterName, email, mobile,
      password, companyLocation, companyWebsite,
    } = req.body;

    // Validate required fields
    if (!companyName || !recruiterName || !email || !mobile || !password || !companyLocation) {
      return res.status(400).json({
        message: "All required fields must be filled.",
        fields: {
          companyName: !companyName ? "Required" : null,
          recruiterName: !recruiterName ? "Required" : null,
          email: !email ? "Required" : null,
          mobile: !mobile ? "Required" : null,
          password: !password ? "Required" : null,
          companyLocation: !companyLocation ? "Required" : null,
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address format." });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Check duplicate email
    const existing = await Employer.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      // If email exists but unverified, offer resend instead
      if (!existing.isEmailVerified) {
        return res.status(409).json({
          message: "An account with this email already exists but is not verified. Please check your email or request a new verification link.",
          canResend: true,
          email: email,
        });
      }
      return res.status(409).json({
        message: "An account with this email already exists. Please login instead.",
        canResend: false,
      });
    }

    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const employer = await Employer.create({
      companyName: companyName.trim(),
      recruiterName: recruiterName.trim(),
      email: email.toLowerCase().trim(),
      mobile,
      password,
      companyLocation,
      companyWebsite: companyWebsite || "",
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email to employer
    await sendVerificationEmail(employer, verificationToken);

    // Notify admin of new registration
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `🆕 New Employer Registration — ${companyName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#2563eb">New Employer Registered</h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold;width:35%">Company</td>
                  <td style="padding:8px">${companyName}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Recruiter</td>
                  <td style="padding:8px">${recruiterName}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Email</td>
                  <td style="padding:8px">${email}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Mobile</td>
                  <td style="padding:8px">${mobile}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Location</td>
                  <td style="padding:8px">${companyLocation}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Registered At</td>
                  <td style="padding:8px">${new Date().toLocaleString("en-IN")}</td></tr>
            </table>
            <p style="color:#dc2626;font-weight:bold">
              ⚠️ Email not yet verified. Approval only possible after email verification.
            </p>
            <a href="${process.env.FRONTEND_URL}/admin"
              style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;
              text-decoration:none;display:inline-block;margin-top:8px;">
              Go to Admin Panel
            </a>
          </div>
        `,
      });
    }

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
      email: employer.email,
    });
  } catch (err) {
    console.error("Employer register error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ── GET /api/employer/verify-email/:token ─────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length < 32) {
      return res.status(400).json({ message: "Invalid verification link." });
    }

    // Find by token
    const employer = await Employer.findOne({
      emailVerificationToken: token,
    });

    // Token not found
    if (!employer) {
      return res.status(400).json({
        message: "Invalid verification link. This link may have already been used.",
        code: "TOKEN_INVALID",
      });
    }

    // Already verified (reused token)
    if (employer.isEmailVerified) {
      return res.status(400).json({
        message: "This email has already been verified. Please login.",
        code: "ALREADY_VERIFIED",
        alreadyVerified: true,
      });
    }

    // Token expired
    if (employer.emailVerificationExpires < new Date()) {
      return res.status(400).json({
        message: "Verification link has expired. Please request a new one.",
        code: "TOKEN_EXPIRED",
        canResend: true,
        email: employer.email,
      });
    }

    // ✅ Mark verified — clear token so it cannot be reused
    employer.isEmailVerified = true;
    employer.emailVerificationToken = null;   // ← cleared = cannot reuse
    employer.emailVerificationExpires = null;
    await employer.save();

    // Notify admin that email is now verified and pending approval
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `✅ Employer Email Verified — ${employer.companyName} (Pending Approval)`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#16a34a">Employer Email Verified</h2>
            <p><strong>${employer.companyName}</strong> (${employer.email}) has verified their email
              and is now awaiting admin approval.</p>
            <a href="${process.env.FRONTEND_URL}/admin"
              style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;
              text-decoration:none;display:inline-block;margin-top:8px;">
              Review & Approve in Admin Panel
            </a>
          </div>
        `,
      });
    }

    res.json({
      message: "Email verified successfully! Your account is now pending admin approval. You will receive an email once approved.",
      code: "VERIFIED",
    });
  } catch (err) {
    console.error("verifyEmail error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── POST /api/employer/resend-verification ────────────────────
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const employer = await Employer.findOne({ email: email.toLowerCase().trim() });

    if (!employer) {
      // Don't reveal if email exists or not (security)
      return res.json({
        message: "If this email is registered, a verification link has been sent.",
      });
    }

    if (employer.isEmailVerified) {
      return res.status(400).json({
        message: "This email is already verified. Please login.",
        alreadyVerified: true,
      });
    }

    // Rate limit: max 3 resends per hour per employer account
    const ONE_HOUR = 60 * 60 * 1000;
    if (
      employer.lastResendAt &&
      Date.now() - employer.lastResendAt.getTime() < ONE_HOUR &&
      employer.emailResendCount >= 3
    ) {
      const minutesLeft = Math.ceil(
        (ONE_HOUR - (Date.now() - employer.lastResendAt.getTime())) / 60000
      );
      return res.status(429).json({
        message: `Too many resend requests. Please wait ${minutesLeft} minutes before trying again.`,
      });
    }

    // Generate new token
    const newToken = generateVerificationToken();
    const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Reset count if last resend was more than 1 hour ago
    const shouldResetCount =
      !employer.lastResendAt ||
      Date.now() - employer.lastResendAt.getTime() >= ONE_HOUR;

    employer.emailVerificationToken = newToken;
    employer.emailVerificationExpires = newExpires;
    employer.emailResendCount = shouldResetCount ? 1 : employer.emailResendCount + 1;
    employer.lastResendAt = new Date();
    await employer.save();

    await sendVerificationEmail(employer, newToken);

    res.json({
      message: "A new verification link has been sent to your email.",
      resendCount: employer.emailResendCount,
    });
  } catch (err) {
    console.error("resendVerification error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── POST /api/employer/login ──────────────────────────────────
export const loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const employer = await Employer.findOne({ email: email.toLowerCase().trim() });

    // Generic message to prevent user enumeration
    if (!employer) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check password first (do not reveal account status before verifying identity)
    const isMatch = await employer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Now check account status
    if (!employer.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in. Check your inbox or request a new verification link.",
        code: "EMAIL_NOT_VERIFIED",
        canResend: true,
        email: employer.email,
      });
    }

    if (employer.isBlocked) {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support.",
        code: "ACCOUNT_BLOCKED",
      });
    }

    if (employer.isRejected) {
      return res.status(403).json({
        message: `Your account registration was not approved. Reason: ${employer.rejectionReason || "Please contact support."}`,
        code: "ACCOUNT_REJECTED",
      });
    }

    if (!employer.isApproved) {
      return res.status(403).json({
        message: "Your account is pending admin approval. You will receive an email once approved.",
        code: "PENDING_APPROVAL",
      });
    }

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
    res.status(500).json({ message: "Server error." });
  }
};

// ── POST /api/employer/forgot-password ───────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const employer = await Employer.findOne({
      email: req.body.email?.toLowerCase().trim(),
    });

    // Always return success to prevent email enumeration
    if (!employer) {
      return res.json({ message: "If this email is registered, a reset link has been sent." });
    }

    const token = generateVerificationToken();
    employer.resetPasswordToken = token;
    employer.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await employer.save();

    const resetUrl = `${process.env.FRONTEND_URL}/employer/reset-password/${token}`;
    await sendEmail({
      to: employer.email,
      subject: "Reset your Resumewala Employer Password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#2563eb">Reset Your Password</h2>
          <p>Hi ${employer.recruiterName}, click the button below to reset your password.</p>
          <a href="${resetUrl}"
            style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;
            text-decoration:none;display:inline-block;margin-top:12px;">
            Reset Password
          </a>
          <p style="margin-top:16px;color:#666;font-size:13px">
            This link expires in 1 hour. If you did not request this, ignore this email.
          </p>
        </div>
      `,
    });

    res.json({ message: "If this email is registered, a reset link has been sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// ── POST /api/employer/reset-password/:token ─────────────────
export const resetPassword = async (req, res) => {
  try {
    const employer = await Employer.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!employer) {
      return res.status(400).json({
        message: "Invalid or expired reset link. Please request a new one.",
      });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    employer.password = req.body.password;
    employer.resetPasswordToken = null;
    employer.resetPasswordExpires = null;
    await employer.save();

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

// ── GET /api/employer/me ──────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const employer = await Employer.findById(req.employer._id).select("-password");
    if (!employer) return res.status(404).json({ message: "Not found." });
    res.json(employer);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};