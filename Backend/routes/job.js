import express from "express";
import multer from "multer";
import { createJob, getJobs, deleteJob, updateJob } from "../controllers/jobController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import CandidateModel from "../models/CandidateModel.js";
import Job from "../models/Job.js";
import ProfileModel from "../models/Profile.js";
import { sendEmail } from "../utils/sendEmail.js";
import { jobAppliedAdminTemplate, jobAppliedUserTemplate } from "../utils/emailTemplates.js";
import UserModel from "../models/User.js";


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

// ----------------- JOB ROUTES -----------------

// Create Job
router.post("/", createJob);

// Get All Jobs
router.get("/", getJobs);

// ✅ APPLY ROUTE MUST BE BEFORE /:id routes
// Otherwise Express reads "apply" as an :id param and it never hits this handler
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

      const profile  = await ProfileModel.findOne({userId})

      // Check if job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }

      // Check if user already applied
      const existing = await CandidateModel.findOne({
        jobId,
        userId,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "You already applied for this job",
        });
      }

      // Create Candidate document
      const candidate = await CandidateModel.create({
        jobId,
        userId,
        personalInfo: profile.personal || {},
        experiences: profile.experience || [],
        education: profile.education || [],
        skills: profile.skills || [],
        resumeUrl: profile.resume?.url || null,
      });

      // after candidate is created, fetch user info for email
      const user = await UserModel.findById(userId);

      //Email to user
      
      await sendEmail({
        to: user.email,
        subject: `✅ Application Submitted - ${job.title} at ${job.company}`,
        html: jobAppliedUserTemplate(user.fullName, job.title, job.company),
      });

      // Email to admin
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

// ✅ /:id routes come AFTER /apply
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;