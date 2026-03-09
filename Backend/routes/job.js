import express from "express";
import multer from "multer";
import { createJob, getJobs, deleteJob, updateJob } from "../controllers/jobController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import CandidateModel from "../models/CandidateModel.js";

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

// Update Job
router.put("/:id", updateJob);

// Delete Job
router.delete("/:id", deleteJob);

// ----------------- APPLY FOR JOB -----------------
router.post(
  "/apply",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      const { jobId, personalInfo, experiences, education, skills } = req.body;

      if (!jobId || !personalInfo) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // ✅ Check if user already applied
      const existing = await CandidateModel.findOne({
        jobId,
        userId: req.user.id,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "You already applied for this job",
        });
      }

      // ✅ Create candidate if not applied before
      const candidate = {
        jobId,
        userId: req.user.id,
        personalInfo: personalInfo ? JSON.parse(personalInfo) : {},
        experiences: experiences ? JSON.parse(experiences) : [],
        education: education ? JSON.parse(education) : [],
        skills: skills ? JSON.parse(skills) : [],
        resumeUrl: req.file ? `/uploads/${req.file.filename}` : null,
      };

      const savedCandidate = await CandidateModel.create(candidate);

      res.json({
        success: true,
        message: "Applied successfully",
        candidate: savedCandidate,
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

export default router;