import express from "express";
import multer from "multer";
import {
  createJob,
  getJobs,
  deleteJob,
  updateJob,
  applyJob,
  getMyJobs,
  getJobById,
  duplicateJob,
  getPublicJobs,
} from "../controllers/jobController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import CandidateModel from "../models/CandidateModel.js";
import Job from "../models/job.js";
import ProfileModel from "../models/Profile.js";
import { sendEmail } from "../utils/sendEmail.js";
import { jobAppliedAdminTemplate, jobAppliedUserTemplate } from "../utils/emailTemplates.js";
import UserModel from "../models/User.js";
import { protectEmployer } from "../middlewares/employerAuthMiddleware.js";

const router = express.Router();

// ----------------- MULTER SETUP -----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ----------------- PHASE 1 JOB ROUTES (unchanged) -----------------

// Create Job
router.post("/", createJob);

// Get All Jobs
router.get("/", getJobs);

// Apply Route
router.post(
  "/apply",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      const { jobId, personalInfo, experiences, education, skills } = req.body;
      const userId = req.user.id;

      if (!jobId || !personalInfo) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const profile = await ProfileModel.findOne({ userId });

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }

      const existing = await CandidateModel.findOne({ jobId, userId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "You already applied for this job",
        });
      }

      const candidate = await CandidateModel.create({
        jobId,
        userId,
        personalInfo: profile.personal || {},
        experiences: profile.experience || [],
        education: profile.education || [],
        skills: profile.skills || [],
        resumeUrl: profile.resume?.url || null,
      });

      // ✅ THIS IS THE FIX — increment both count fields
      await Job.findByIdAndUpdate(jobId, {
        $inc: { applicantsCount: 1, applicationsCount: 1 }
      });

      const user = await UserModel.findById(userId);

      await sendEmail({
        to: user.email,
        subject: `✅ Application Submitted - ${job.title} at ${job.company}`,
        html: jobAppliedUserTemplate(user.fullName, job.title, job.company),
      });

      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `📋 New Application - ${job.title} at ${job.company}`,
        html: jobAppliedAdminTemplate(user.fullName, user.email, job.title, job.company),
      });

      res.status(201).json({
        success: true,
        message: "Applied successfully",
        candidate,
      });

    } catch (err) {
      console.error("Apply Job Error:", err);
      res.status(500).json({
        success: false,
        message: "Server error while applying",
      });
    }
  }
);

router.get("/applied", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await CandidateModel.find({ userId }).select("jobId");
    const jobIds = applications.map((app) => app.jobId.toString());
    res.status(200).json({ success: true, jobIds });
  } catch (error) {
    console.error("Fetch applied jobs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch applied jobs" });
  }
});

// Phase 1 /:id routes
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

// ----------------- PHASE 2 JOB ROUTES (new) -----------------

// Public job listing for candidates browsing
router.get("/public", getPublicJobs);

// Employer-specific job routes (protected)
router.get("/employer/myjobs", protectEmployer, getMyJobs);
router.get("/employer/:id", protectEmployer, getJobById);
router.post("/employer/:id/duplicate", protectEmployer, duplicateJob);

export default router;