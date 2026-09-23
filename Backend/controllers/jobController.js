import Job from "../models/job.js";
import Employer from "../models/Employer.js";
import CandidateModel from "../models/CandidateModel.js";
import { INDUSTRIES } from "../utils/industries.js";

// ─── Helper: validate industry ────────────────────────────────
const validateIndustry = (industry) => {
  if (!industry) return true; // optional field
  return INDUSTRIES.includes(industry);
};

// ─── EMPLOYER: Create job ─────────────────────────────────────
export const createJob = async (req, res) => {
  try {
    if (req.employer) {

      // ✅ Validate industry if provided
      if (req.body.industryCategory && !validateIndustry(req.body.industryCategory)) {
        return res.status(400).json({
          message: "Invalid industry category selected.",
        });
      }

      // Strip fields employer should never set
      const {
        employer, employerId, postedBy,
        isAdminApproved, approvedBy, approvedAt,
        status, // employer cannot set status manually
        ...safeBody
      } = req.body;

      const job = await Job.create({
        ...safeBody,
        employer: req.employer._id,
        employerId: req.employer._id,
        postedBy: "employer",
        status: "pending",          // always pending for employer
        isAdminApproved: false,     // always false until admin approves
      });

      return res.status(201).json({
        message: "Job submitted for admin approval. It will be visible once approved.",
        job,
      });
    }

    // ── ADMIN: Create job ──────────────────────────────────────
    if (req.body.industryCategory && !validateIndustry(req.body.industryCategory)) {
      return res.status(400).json({ message: "Invalid industry category." });
    }

    const job = await Job.create({
      ...req.body,
      postedBy: "admin",
      status: "Active",
      isAdminApproved: true,
    });

    res.status(201).json({ job });
  } catch (error) {
    console.error("createJob error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── EMPLOYER: Update job ─────────────────────────────────────
export const updateJob = async (req, res) => {
  try {
    // ✅ Validate industry if provided
    if (req.body.industryCategory && !validateIndustry(req.body.industryCategory)) {
      return res.status(400).json({ message: "Invalid industry category." });
    }

    // Strip fields employer should never modify
    const {
      employer, employerId, postedBy,
      isAdminApproved, approvedBy, approvedAt,
      ...safeBody
    } = req.body;

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, employer: req.employer._id },
      safeBody,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found." });
    res.json({ job });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ─── EMPLOYER: Get my jobs ────────────────────────────────────
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.employer._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── EMPLOYER: Get single job ─────────────────────────────────
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employer: req.employer._id,
    });
    if (!job) return res.status(404).json({ message: "Job not found." });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── EMPLOYER: Delete job ─────────────────────────────────────
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      employer: req.employer._id,
    });
    if (!job) return res.status(404).json({ message: "Job not found." });
    res.json({ message: "Job deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── EMPLOYER: Duplicate job ──────────────────────────────────
export const duplicateJob = async (req, res) => {
  try {
    const original = await Job.findOne({
      _id: req.params.id,
      employer: req.employer._id,
    });
    if (!original) return res.status(404).json({ message: "Job not found." });

    const {
      _id, createdAt, updatedAt, applicantsCount,
      applicationsCount, approvedBy, approvedAt,
      rejectedAt, rejectionReason, ...jobData
    } = original.toObject();

    const duplicate = await Job.create({
      ...jobData,
      title: `${original.title} (Copy)`,
      status: "pending",
      isAdminApproved: false,
      applicantsCount: 0,
      applicationsCount: 0,
    });

    res.status(201).json({ message: "Job duplicated.", job: duplicate });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── ADMIN: Get all jobs ──────────────────────────────────────
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("employer", "companyName email companyLogo")
      .sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN: Delete job ─────────────────────────────────────────
export const deleteJob_Admin = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN: Update job ─────────────────────────────────────────
export const updateJob_Admin = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── CANDIDATE: Apply job (Phase 1) ──────────────────────────
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const existing = await CandidateModel.findOne({ jobId, userId });
    if (existing) return res.status(400).json({ success: false, message: "Already applied" });

    const ProfileModel = (await import("../models/Profile.js")).default;
    const profile = await ProfileModel.findOne({ userId });

    await CandidateModel.create({
      jobId,
      userId,
      personalInfo: profile?.personal || {},
      experiences: profile?.experience || [],
      education: profile?.education || [],
      skills: profile?.skills || [],
      resumeUrl: profile?.resume?.url || null,
    });

    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicantsCount: 1, applicationsCount: 1 },
    });

    res.json({ success: true, message: "Applied successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to apply" });
  }
};

// ─── PUBLIC: Browse Jobs ──────────────────────────────────────

export const getPublicJobs = async (req, res) => {
  try {
    const { search, location, type, mode, industry, page = 1, limit = 10 } = req.query;

    if (industry && !validateIndustry(industry)) {
      return res.status(400).json({ message: "Invalid industry filter." });
    }

    // ✅ Clean query — works because all docs now have proper fields
    const baseQuery = {
      $or: [
        { postedBy: "admin", status: "Active" },
        { postedBy: "employer", isAdminApproved: true, status: "approved" },
      ],
    };

    const conditions = [baseQuery];

    if (search) {
      conditions.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { keySkills: { $regex: search, $options: "i" } },
          { requirements: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    }
    if (location) conditions.push({ location: { $regex: location, $options: "i" } });
    if (type) conditions.push({ $or: [{ employmentType: type }, { jobType: type }] });
    if (mode) conditions.push({ workMode: mode });
    if (industry) conditions.push({ industryCategory: industry });

    const query = conditions.length > 1 ? { $and: conditions } : baseQuery;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate("employer", "companyName companyLogo companyLocation isVerified")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("getPublicJobs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// export const getPublicJobs = async (req, res) => {
//   try {
//     const {
//       search, location, type, mode,
//       industry, page = 1, limit = 10,
//     } = req.query;

//     // ✅ Validate industry filter if provided
//     if (industry && !validateIndustry(industry)) {
//       return res.status(400).json({ message: "Invalid industry filter." });
//     }

//     const baseQuery = {
//       $or: [
//         { postedBy: "admin", status: "Active" },
//         { postedBy: "employer", isAdminApproved: true, status: "approved" },
//         { postedBy: { $exists: false }, status: "Active" },
//         { postedBy: null, status: "Active" },
//       ],
//     };

//     const conditions = [baseQuery];

//     if (search) {
//       conditions.push({
//         $or: [
//           { title: { $regex: search, $options: "i" } },
//           { keySkills: { $regex: search, $options: "i" } },
//           { requirements: { $regex: search, $options: "i" } },
//           { description: { $regex: search, $options: "i" } },
//         ],
//       });
//     }
//     if (location) conditions.push({ location: { $regex: location, $options: "i" } });
//     if (type) conditions.push({ $or: [{ employmentType: type }, { jobType: type }] });
//     if (mode) conditions.push({ workMode: mode });
//     if (industry) conditions.push({ industryCategory: industry });

//     const query = conditions.length > 1 ? { $and: conditions } : baseQuery;

//     const total = await Job.countDocuments(query);
//     const jobs = await Job.find(query)
//       .populate("employer", "companyName companyLogo companyLocation isVerified")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
//   } catch (err) {
//     console.error("getPublicJobs error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };






















// import Job from "../models/job.js";
// import Employer from "../models/Employer.js";
// import CandidateModel from "../models/CandidateModel.js";

// // ─── EMPLOYER: Create job — no credit limits ──────────────────
// export const createJob = async (req, res) => {
//   try {
//     if (req.employer) {
//       // ✅ Employer can post unlimited jobs — no credit check
//       const job = await Job.create({
//         ...req.body,
//         employer: req.employer._id,
//         employerId: req.employer._id,
//         postedBy: "employer",
//         status: "pending",
//         isAdminApproved: false,
//       });

//       return res.status(201).json({
//         message: "Job submitted for admin approval. It will be visible once approved.",
//         job,
//       });
//     }

//     // ── ADMIN: Create job — auto approved ─────────────────────
//     const job = await Job.create({
//       ...req.body,
//       postedBy: "admin",
//       status: "Active",
//       isAdminApproved: true,
//     });

//     res.status(201).json({ job });
//   } catch (error) {
//     console.error("createJob error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // ─── EMPLOYER: Get my jobs ────────────────────────────────────
// export const getMyJobs = async (req, res) => {
//   try {
//     const jobs = await Job.find({ employer: req.employer._id })
//       .sort({ createdAt: -1 })
//       .lean();

//     res.json({ jobs });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── EMPLOYER: Get single job ─────────────────────────────────
// export const getJobById = async (req, res) => {
//   try {
//     // ✅ Security: employer can only see their own job
//     const job = await Job.findOne({
//       _id: req.params.id,
//       employer: req.employer._id,
//     });
//     if (!job) return res.status(404).json({ message: "Job not found." });
//     res.json(job);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── EMPLOYER: Update job ─────────────────────────────────────
// export const updateJob = async (req, res) => {
//   try {
//     // ✅ Security: employer can only update their own job
//     // Strip fields that employer should never be able to set directly
//     const {
//       employer, employerId, postedBy,
//       isAdminApproved, approvedBy, approvedAt, ...safeBody
//     } = req.body;

//     const job = await Job.findOneAndUpdate(
//       { _id: req.params.id, employer: req.employer._id },
//       safeBody,
//       { new: true }
//     );
//     if (!job) return res.status(404).json({ message: "Job not found." });
//     res.json({ job });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── EMPLOYER: Delete job ─────────────────────────────────────
// export const deleteJob = async (req, res) => {
//   try {
//     // ✅ Security: employer can only delete their own job
//     const job = await Job.findOneAndDelete({
//       _id: req.params.id,
//       employer: req.employer._id,
//     });
//     if (!job) return res.status(404).json({ message: "Job not found." });
//     res.json({ message: "Job deleted." });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── EMPLOYER: Duplicate job ──────────────────────────────────
// export const duplicateJob = async (req, res) => {
//   try {
//     const original = await Job.findOne({
//       _id: req.params.id,
//       employer: req.employer._id,
//     });
//     if (!original) return res.status(404).json({ message: "Job not found." });

//     const {
//       _id, createdAt, updatedAt, applicantsCount,
//       applicationsCount, approvedBy, approvedAt,
//       rejectedAt, rejectionReason, ...jobData
//     } = original.toObject();

//     const duplicate = await Job.create({
//       ...jobData,
//       title: `${original.title} (Copy)`,
//       status: "pending",
//       isAdminApproved: false,
//       applicantsCount: 0,
//       applicationsCount: 0,
//     });

//     res.status(201).json({ message: "Job duplicated.", job: duplicate });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── ADMIN: Get all jobs ──────────────────────────────────────
// export const getJobs = async (req, res) => {
//   try {
//     const jobs = await Job.find()
//       .populate("employer", "companyName email companyLogo")
//       .sort({ createdAt: -1 });
//     res.status(200).json({ jobs });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ─── ADMIN: Delete job ────────────────────────────────────────
// export const deleteJob_Admin = async (req, res) => {
//   try {
//     const job = await Job.findByIdAndDelete(req.params.id);
//     if (!job) return res.status(404).json({ message: "Job not found" });
//     res.json({ message: "Job deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ─── ADMIN: Update job ────────────────────────────────────────
// export const updateJob_Admin = async (req, res) => {
//   try {
//     const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!job) return res.status(404).json({ message: "Job not found" });
//     res.status(200).json({ job });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ─── CANDIDATE: Apply job (Phase 1) ──────────────────────────
// export const applyJob = async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     const userId = req.user.id;

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ success: false, message: "Job not found" });

//     const existing = await CandidateModel.findOne({ jobId, userId });
//     if (existing) return res.status(400).json({ success: false, message: "Already applied" });

//     const ProfileModel = (await import("../models/Profile.js")).default;
//     const profile = await ProfileModel.findOne({ userId });

//     await CandidateModel.create({
//       jobId,
//       userId,
//       personalInfo: profile?.personal || {},
//       experiences: profile?.experience || [],
//       education: profile?.education || [],
//       skills: profile?.skills || [],
//       resumeUrl: profile?.resume?.url || null,
//     });

//     await Job.findByIdAndUpdate(jobId, {
//       $inc: { applicantsCount: 1, applicationsCount: 1 },
//     });

//     res.json({ success: true, message: "Applied successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Failed to apply" });
//   }
// };

// // ─── PUBLIC: Browse Jobs ──────────────────────────────────────
// export const getPublicJobs = async (req, res) => {
//   try {
//     const { search, location, type, mode, industry, page = 1, limit = 10 } = req.query;

//     const baseQuery = {
//       $or: [
//         { postedBy: "admin", status: "Active" },
//         { postedBy: "employer", isAdminApproved: true, status: "approved" },
//         { postedBy: { $exists: false }, status: "Active" },
//         { postedBy: null, status: "Active" },
//       ],
//     };

//     const conditions = [baseQuery];

//     if (search) {
//       conditions.push({
//         $or: [
//           { title: { $regex: search, $options: "i" } },
//           { keySkills: { $regex: search, $options: "i" } },
//           { requirements: { $regex: search, $options: "i" } },
//           { description: { $regex: search, $options: "i" } },
//         ],
//       });
//     }
//     if (location) conditions.push({ location: { $regex: location, $options: "i" } });
//     if (type) conditions.push({ $or: [{ employmentType: type }, { jobType: type }] });
//     if (mode) conditions.push({ workMode: mode });
//     if (industry) conditions.push({ industryCategory: { $regex: industry, $options: "i" } });

//     const query = conditions.length > 1 ? { $and: conditions } : baseQuery;

//     const total = await Job.countDocuments(query);
//     const jobs = await Job.find(query)
//       .populate("employer", "companyName companyLogo companyLocation isVerified")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
//   } catch (err) {
//     console.error("getPublicJobs error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };