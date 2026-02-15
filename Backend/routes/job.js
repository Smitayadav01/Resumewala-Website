import express from "express";
import multer from "multer";
import { createJob, getJobs, deleteJob } from "../controllers/jobController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import CandidateModel from "../models/CandidateModel.js"; 

const router = express.Router();

// ----------------- MULTER SETUP -----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ----------------- JOB ROUTES -----------------

// ✅ Create Job (Admin only)
router.post(
  "/",
  // authMiddleware,
  // roleMiddleware("admin"),
  createJob
);

// ✅ Get All Jobs (Public)
router.get("/", getJobs);

// ✅ Delete Job (Admin only)
router.delete(
  "/:id",
  // authMiddleware,
  // roleMiddleware("admin"),
  deleteJob
);


// ----------------- APPLY FOR JOB -----------------
router.post(
  "/apply",
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      const { jobId, personalInfo, experiences, education, skills } = req.body;

      if (!jobId || !personalInfo) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      // Safely parse JSON
      const candidate = {
        jobId,
        userId: req.user.id, // from authMiddleware
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
      res.status(500).json({ success: false, message: "Server error while applying" });
    }
  }
);


export default router;