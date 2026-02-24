import express from "express";
import {Login,Register,GoogleLogin} from "../controllers/userController.js";
import { ForgotPassword, ResetPassword,VerifyEmail} from "../controllers/userController.js";
import { VerifyOTP } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", Register);

router.post("/login", Login);

router.post("/google-login", GoogleLogin);

router.post("/forgot-password", ForgotPassword);

router.post("/reset-password/:token", ResetPassword);

router.get("/verify-email/:token", VerifyEmail);

// router.post("/verify-otp", VerifyOTP);

// router.post("/resend-otp", ResendOTP);

export default router;
