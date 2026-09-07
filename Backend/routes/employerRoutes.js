import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { protectEmployer } from "../middlewares/employerAuthMiddleware.js";

import {
  registerEmployer, verifyEmail, loginEmployer,
  forgotPassword, resetPassword, getMe,
} from "../controllers/employerAuthController.js";

import {
  createJob, getMyJobs, getJobById, updateJob,
  deleteJob, duplicateJob,
} from "../controllers/jobController.js";

import {
  getApplicants,
  getEmployerAllApplicants,
  updateApplicationStatus,
  getDashboardStats,
} from "../controllers/applicationController.js";

import { updateProfile, uploadLogo } from "../controllers/employerProfileController.js";
import { createOrder, verifyPayment, getPaymentHistory } from "../controllers/paymentController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Auth (public) ─────────────────────────────────────────────
router.post("/register", registerEmployer);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", loginEmployer);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ✅ Resume view — PUBLIC route (no auth needed, before protectEmployer)
// The filename is a random string so it's not guessable
router.get("/resume/view/:filename", (req, res) => {
  try {
    const safeName = path.basename(req.params.filename);
    const filePath = path.join(__dirname, "..", "uploads", safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Resume not found.");
    }

    const ext = path.extname(safeName).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    res.setHeader("Content-Type", mimeTypes[ext] || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=3600");

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("Resume view error:", err);
    res.status(500).send("Server error");
  }
});

// ─── Protected routes (all below need employer token) ──────────
router.use(protectEmployer);

router.get("/me", getMe);
router.get("/dashboard/stats", getDashboardStats);

router.put("/profile", updateProfile);
router.post("/profile/logo", upload.single("logo"), uploadLogo);

router.post("/jobs", createJob);
router.get("/jobs", getMyJobs);
router.get("/jobs/:id", getJobById);
router.put("/jobs/:id", updateJob);
router.delete("/jobs/:id", deleteJob);
router.post("/jobs/:id/duplicate", duplicateJob);

router.get("/applicants/all", getEmployerAllApplicants);
router.get("/jobs/:jobId/applicants", getApplicants);
router.patch("/applications/:id/status", updateApplicationStatus);

router.post("/payment/create-order", createOrder);
router.post("/payment/verify", verifyPayment);
router.get("/payment/history", getPaymentHistory);



export default router;