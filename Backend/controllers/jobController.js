import Job from "../models/job.js";
import Employer from "../models/Employer.js";
import CandidateModel from "../models/CandidateModel.js";

// ─── EMPLOYER: Create job with free credit check ──────────────
export const createJob = async (req, res) => {
  try {
    if (req.employer) {
      const employer = await Employer.findById(req.employer._id);

      // ── Credit check logic ─────────────────────────────────
      const sub = employer.subscription;
      const hasPaidPlan =
        sub?.plan && sub.plan !== "none" &&
        sub.jobCredits > 0 &&
        (!sub.expiresAt || new Date() < new Date(sub.expiresAt));

      // Count total jobs employer has posted (any status except deleted)
      const totalJobsPosted = await Job.countDocuments({
        employer: employer._id,
        postedBy: "employer",
      });

      // Free tier: 2 jobs allowed
      const FREE_JOB_LIMIT = 2;
      const hasFreePosts = totalJobsPosted < FREE_JOB_LIMIT;

      // Check if employer can post
      if (!hasFreePosts && !hasPaidPlan) {
        return res.status(403).json({
          message: `You have used your ${FREE_JOB_LIMIT} free job postings. Please purchase a plan to post more jobs.`,
          requiresPlan: true,
          totalPosted: totalJobsPosted,
          freeLimit: FREE_JOB_LIMIT,
        });
      }

      // If paid plan — deduct credit (not for free posts)
      if (!hasFreePosts && hasPaidPlan && sub.plan !== "premium") {
        if (sub.jobCredits <= 0) {
          return res.status(403).json({
            message: "No job credits remaining. Please upgrade your plan.",
            requiresPlan: true,
          });
        }
      }

      // Create the job
      const job = await Job.create({
        ...req.body,
        employer: employer._id,
        employerId: employer._id,
        postedBy: "employer",
        status: "pending",
        isAdminApproved: false,
      });

      // Deduct paid credit only after free posts used
      if (!hasFreePosts && hasPaidPlan && sub.plan !== "premium") {
        await Employer.findByIdAndUpdate(employer._id, {
          $inc: { "subscription.jobCredits": -1 },
        });
      }

      // Calculate remaining credits for response
      const remaining = hasFreePosts
        ? Math.max(0, FREE_JOB_LIMIT - (totalJobsPosted + 1))
        : sub.plan === "premium"
        ? "Unlimited"
        : Math.max(0, sub.jobCredits - 1);

      return res.status(201).json({
        message: hasFreePosts
          ? `Job submitted for admin approval. Free posts remaining: ${remaining}`
          : "Job submitted for admin approval.",
        job,
        isFreePost: hasFreePosts,
        creditsRemaining: remaining,
        totalPosted: totalJobsPosted + 1,
      });
    }

    // ── ADMIN: Create job — auto approved ─────────────────────
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

// ─── ADMIN: Get all jobs ───────────────────────────────────────
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

// ─── ADMIN: Delete job ────────────────────────────────────────
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN: Update job ────────────────────────────────────────
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── CANDIDATE: Apply for job (Phase 1) ──────────────────────
export const applyJob = async (req, res) => {
  try {
    const { jobId, personalInfo, experiences, education, skills } = req.body;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const existing = await CandidateModel.findOne({ jobId, userId });
    if (existing) return res.status(400).json({ success: false, message: "Already applied" });

    await CandidateModel.create({
      jobId,
      userId,
      personalInfo: JSON.parse(personalInfo),
      experiences: JSON.parse(experiences),
      education: JSON.parse(education),
      skills: JSON.parse(skills),
      resumeUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    // ✅ Increment count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicantsCount: 1, applicationsCount: 1 },
    });

    res.json({ success: true, message: "Applied successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to apply" });
  }
};

// ─── EMPLOYER: Get my jobs ────────────────────────────────────
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.employer._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── EMPLOYER: Get single job ─────────────────────────────────
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.employer._id });
    if (!job) return res.status(404).json({ message: "Job not found." });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── EMPLOYER: Duplicate job ──────────────────────────────────
export const duplicateJob = async (req, res) => {
  try {
    const original = await Job.findOne({ _id: req.params.id, employer: req.employer._id });
    if (!original) return res.status(404).json({ message: "Job not found." });

    const { _id, createdAt, updatedAt, applicantsCount, applicationsCount, approvedBy, approvedAt, ...jobData } = original.toObject();
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

// ─── PUBLIC: Browse Jobs ──────────────────────────────────────
// Shows: Admin jobs (postedBy=admin, Active) + Approved employer jobs
export const getPublicJobs = async (req, res) => {
  try {
    const { search, location, type, mode, industry, page = 1, limit = 10 } = req.query;

    // ✅ KEY LOGIC:
    // Show admin-posted jobs (postedBy = "admin", status = "Active")
    // AND employer-posted jobs that are approved (postedBy = "employer", isAdminApproved = true)
    const baseQuery = {
      $or: [
        // Admin jobs — existing behaviour preserved
        {
          postedBy: "admin",
          status: "Active",
        },
        // Employer jobs — only approved ones
        {
          postedBy: "employer",
          isAdminApproved: true,
          status: "approved",
        },
        // Backward compat: jobs with no postedBy field (old records)
        {
          postedBy: { $exists: false },
          status: "Active",
        },
        {
          postedBy: null,
          status: "Active",
        },
      ],
    };

    // Expiry filter only for employer jobs (admin jobs may not have expiryDate)
    const query = { ...baseQuery };

    if (search) {
      query.$and = [{
        $or: [
          { title: { $regex: search, $options: "i" } },
          { keySkills: { $regex: search, $options: "i" } },
          { requirements: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }];
    }
    if (location) query.location = { $regex: location, $options: "i" };
    if (type) query.$and = [...(query.$and || []), { $or: [{ employmentType: type }, { jobType: type }] }];
    if (mode) query.workMode = mode;
    if (industry) query.industryCategory = { $regex: industry, $options: "i" };

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