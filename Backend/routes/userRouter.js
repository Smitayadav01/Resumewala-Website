import express from "express";
import {Login,Register,GoogleLogin,RefreshToken,Logout,Me} from "../controllers/userController.js";
import { ForgotPassword, ResetPassword,VerifyEmail} from "../controllers/userController.js";
import { VerifyOTP } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", Register);

router.post("/login", Login);

router.post("/google-login", GoogleLogin);

router.post("/refresh", RefreshToken);

router.post("/logout", Logout);

router.get("/me", authMiddleware, Me);

router.post("/forgot-password", ForgotPassword);

router.post("/reset-password/:token", ResetPassword);

router.get("/verify-email/:token", VerifyEmail);

// router.post("/verify-otp", VerifyOTP);

// router.post("/resend-otp", ResendOTP);

export default router;
