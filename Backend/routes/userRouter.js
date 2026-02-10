import express from "express";

import {Login,Register} from "../controllers/userController.js"

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", Register);

/**
 * @route   POST /api/users/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", Login);

export default router;
