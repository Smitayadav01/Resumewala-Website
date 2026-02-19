import express from "express";
import {Login,Register,GoogleLogin} from "../controllers/userController.js";
import { ForgotPassword, ResetPassword } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", Register);

router.post("/login", Login);

router.post("/google-login", GoogleLogin);

router.post("/forgot-password", ForgotPassword);

router.post("/reset-password/:token", ResetPassword);

export default router;
