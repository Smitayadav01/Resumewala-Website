import rateLimit from "express-rate-limit";

// Rate limiter for verification endpoints
export const verificationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for resend email
export const resendRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    message: "Too many resend requests. Please try again after 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});