import Job from "../models/Job.js";
import CandidateModel from "../models/CandidateModel.js";


// Create Job
export const createJob = async (req, res) => {
  try {
    console.log("🔥 POST /api/jobs called");
    console.log("Incoming Job:", req.body);
    const job = await Job.create(req.body);
    res.status(201).json({ job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const applyJob = async (req, res) => {
  try {
    const { jobId, personalInfo, experiences, education, skills } = req.body;

    const candidate = await CandidateModel.create({
      jobId,
      personalInfo: JSON.parse(personalInfo),
      experiences: JSON.parse(experiences),
      education: JSON.parse(education),
      skills: JSON.parse(skills),
      resumeUrl: req.file ? `/uploads/${req.file.filename}` : null,
      userId: req.user.id,
    });

    res.json({ success: true, message: "Applied successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to apply" });
  }
};
