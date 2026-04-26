import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { sendEmail } from "../utils/sendEmail.js";
import {
  welcomeTemplate,
  verifyEmailTemplate,
  resetPasswordTemplate,
  adminNotificationTemplate
} from "../utils/emailTemplates.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const REFRESH_COOKIE_NAME = "rw_refresh";

const publicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  mobileNumber: user.mobileNumber,
  role: user.role
});

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
      type: "access"
    },
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      tokenId: crypto.randomBytes(16).toString("hex"),
      type: "refresh"
    },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
  );

const setRefreshCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearRefreshCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth"
  });
};

const readCookie = (req, name) => {
  const rawCookie = req.headers.cookie;
  if (!rawCookie) return null;

  return rawCookie
    .split(";")
    .map((cookie) => cookie.trim())
    .reduce((value, cookie) => {
      const [key, ...rest] = cookie.split("=");
      return key === name ? decodeURIComponent(rest.join("=")) : value;
    }, null);
};

const issueAuthTokens = async (res, user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  setRefreshCookie(res, refreshToken);

  return accessToken;
};

export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log("Forgot password called");
console.log("Email received:", email);

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `https://resumewala.co.in/reset-password/${resetToken}`;

    await sendEmail({
  to: user.email,
  subject: "Reset Your Password - Resumewala",
  html: resetPasswordTemplate(user.fullName, resetUrl),
});

    res.status(200).json({
      success: true,
      message: "Reset email sent",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Email failed",
    });
  }
};

export const ResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Reset failed"
    });
  }
};


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const GoogleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        mobileNumber: 9999999999,
        googleId: sub,
        password: crypto.randomBytes(16).toString("hex"),
      });

      await sendEmail({
        to: user.email,
        subject: "Welcome to Resumewala",
        html: welcomeTemplate(name),
      });
    }

    const token = await issueAuthTokens(res, user);

    return res.status(200).json({
      success: true,
      token,
      accessToken: token,
      user: publicUser(user),
    });

  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};
export const Register = async (req, res) => {
  try {
    const { fullName, mobileNumber, email, password } = req.body;

    // 1️⃣ Validate input
    if (!fullName || !mobileNumber || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNumber }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    // 3️⃣ Create user
    const user = await User.create({
      fullName,
      email,
      mobileNumber,
      password
    });

//     const otp = generateOTP();

// user.emailOTP = otp;
// user.emailOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

// await user.save();

// await sendEmail({
//   to: user.email,
//   subject: "Verify Your Email - OTP",
//   html: `
//     <div style="font-family:Arial;padding:20px">
//       <h2>Email Verification</h2>
//       <p>Hello ${user.fullName},</p>
//       <p>Your OTP for email verification is:</p>
//       <h1 style="letter-spacing:5px;">${otp}</h1>
//       <p>This OTP expires in 10 minutes.</p>
//     </div>
//   `
// });

    
    const token = await issueAuthTokens(res, user);

//     // Generate verification token
// const verifyToken = crypto.randomBytes(32).toString("hex");

// user.emailVerifyToken = crypto
//   .createHash("sha256")
//   .update(verifyToken)
//   .digest("hex");

// user.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000;

// await user.save();

// const verifyUrl = `http://localhost:5173/verify-email/${verifyToken}`;

// await sendEmail({
//   to: user.email,
//   subject: "Verify Your Email",
//   html: verifyEmailTemplate(user.fullName, verifyUrl),
// });


    // 5️⃣ Send welcome email to user
//     await sendEmail({
//   to: user.email,
//   subject: "Welcome to Resumewala 🎉",
//   html: welcomeTemplate(user.fullName),
// });

//     // 6️⃣ Send admin notification email
//     await sendEmail({
//   to: process.env.ADMIN_EMAIL,
//   subject: "🚀 New User Registered - Resumewala",
//   html: adminNotificationTemplate(user),
// });

    // 7️⃣ Send response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      accessToken: token,
      user: publicUser(user)
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number and password are required"
      });
    }

    // 2️⃣ Find user (email OR mobile)
    const user = await User.findOne({
      email
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }


    const token = await issueAuthTokens(res, user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      accessToken: token,
      user: publicUser(user)
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const RefreshToken = async (req, res) => {
  try {
    const refreshToken = readCookie(req, REFRESH_COOKIE_NAME);

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing"
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
      clearRefreshCookie(res);
      return res.status(401).json({
        success: false,
        message: "Refresh token invalid"
      });
    }

    const token = await issueAuthTokens(res, user);

    return res.status(200).json({
      success: true,
      token,
      accessToken: token,
      user: publicUser(user)
    });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(401).json({
      success: false,
      message: "Refresh token expired"
    });
  }
};

export const Logout = async (req, res) => {
  try {
    const refreshToken = readCookie(req, REFRESH_COOKIE_NAME);

    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshTokenHash: hashToken(refreshToken) },
        { $unset: { refreshTokenHash: "" } }
      );
    }

    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  }
};

export const Me = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: publicUser(req.user)
  });
};



export const VerifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    user.isVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Verification failed"
    });
  }
};

export const VerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (
      user.emailOTP !== otp ||
      user.emailOTPExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    user.isVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Verification failed"
    });
  }
};

export const ResendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified"
      });
    }

    const otp = generateOTP();

    user.emailOTP = otp;
    user.emailOTPExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Resend OTP - Email Verification",
      html: `<h2>Your New OTP: ${otp}</h2>`
    });

    res.json({
      success: true,
      message: "OTP resent successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Resend failed"
    });
  }
};


