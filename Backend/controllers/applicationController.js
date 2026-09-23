import Application from "../models/Application.js";
import CandidateModel from "../models/CandidateModel.js";
import Job from "../models/job.js";
import Employer from "../models/Employer.js";
import { sendEmail } from "../utils/sendEmail.js";

// ─── Candidate applies (Phase 2) ──────────────────────────────
export const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate("employer");
    if (!job || job.status !== "approved" || !job.isAdminApproved) {
      return res.status(404).json({ message: "Job not found or not available." });
    }
    const alreadyApplied = await Application.findOne({
      job: job._id, candidate: req.user._id,
    });
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied." });
    }
    const application = await Application.create({
      job: job._id,
      employer: job.employer._id,
      candidate: req.user._id,
      candidateName: req.user.fullName || req.body.candidateName || "",
      candidateEmail: req.user.email || req.body.candidateEmail || "",
      candidatePhone: req.body.candidatePhone || String(req.user.mobileNumber || ""),
      experience: req.body.experience || "",
      location: req.body.location || "",
      education: req.body.education || "",
      keySkills: req.body.keySkills || [],
      resumeUrl: req.body.resumeUrl || "",
    });
    await Job.findByIdAndUpdate(job._id, {
      $inc: { applicantsCount: 1, applicationsCount: 1 },
    });
    if (job.employer?.email) {
      await sendEmail({
        to: job.employer.email,
        subject: `New Application for "${job.title}"`,
        html: `<h2>New Application</h2><p>${application.candidateName} applied for ${job.title}.</p>`,
      });
    }
    res.status(201).json({ message: "Applied successfully.", application });
  } catch (err) {
    console.error("applyForJob error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Helper: build resume URL from CandidateModel record ──────
const buildResumeUrl = (c) => {
  const API_BASE = process.env.BACKEND_URL || "http://localhost:5000";

  if (!c.resumeUrl) return "";

  // Already a full Cloudinary or external URL — use Google Docs viewer for docx
  if (c.resumeUrl.startsWith("http")) return c.resumeUrl;

  // Local path — extract filename and route through proxy
  let filename = c.resumeUrl;
  if (filename.startsWith("/uploads/")) {
    filename = filename.replace("/uploads/", "");
  }
  if (filename.startsWith("uploads/")) {
    filename = filename.replace("uploads/", "");
  }

  return `${API_BASE}/api/employer/resume/view/${filename}`;
};

// ─── Helper: normalize a CandidateModel record ────────────────
const normalizePhase1 = (c, jobTitle = "") => {
  const personalInfo = c.personalInfo || {};
  const experiences = Array.isArray(c.experiences) ? c.experiences : [];
  const education = Array.isArray(c.education) ? c.education : [];
  return {
    _id: String(c._id),
    source: "phase1",
    candidateName: personalInfo.fullName || c.userId?.fullName || "Candidate",
    candidateEmail: personalInfo.email || c.userId?.email || "",
    candidatePhone: personalInfo.mobileNumbers || personalInfo.phone || String(c.userId?.mobileNumber || ""),
    experience: experiences.length > 0
      ? `${experiences[0].jobTitle || experiences[0].role || ""} at ${experiences[0].company || ""}`.trim()
      : "",
    education: education.length > 0
      ? `${education[0].degree || ""} — ${education[0].institution || education[0].college || ""}`.trim()
      : "",
    location: personalInfo.location || personalInfo.city || "",
    keySkills: Array.isArray(c.skills) ? c.skills : [],
    resumeUrl: buildResumeUrl(c),   // ✅ properly resolved URL
    status: "Applied",
    appliedAt: c.createdAt || new Date(),
    jobTitle,
  };
};

// ─── Helper: normalize an Application record ──────────────────
const normalizePhase2 = (a, jobTitle = "") => ({
  _id: String(a._id),
  source: "phase2",
  candidateName: a.candidateName || "Candidate",
  candidateEmail: a.candidateEmail || "",
  candidatePhone: a.candidatePhone || "",
  experience: a.experience || "",
  education: a.education || "",
  location: a.location || "",
  keySkills: a.keySkills || [],
  resumeUrl: a.resumeUrl || "",
  status: a.status || "Applied",
  appliedAt: a.appliedAt || a.createdAt,
  jobTitle,
});

// ─── Helper: merge + deduplicate by email ─────────────────────
const mergeApplicants = (phase2, phase1, sortOrder = -1) => {
  const seen = new Set();
  const merged = [...phase2, ...phase1].filter((a) => {
    const key = a.candidateEmail?.toLowerCase() || a._id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  merged.sort((a, b) =>
    sortOrder === -1
      ? new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      : new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
  );
  return merged;
};

// ─── EMPLOYER: Get applicants for ONE specific job ────────────
export const getApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { sortBy = "newest" } = req.query;
    const employerId = req.employer._id;
    const sortOrder = sortBy === "oldest" ? 1 : -1;

    const job = await Job.findOne({ _id: jobId, employer: employerId });
    if (!job) return res.status(404).json({ message: "Job not found." });

    const phase2Apps = await Application.find({ job: jobId, employer: employerId })
      .sort({ appliedAt: sortOrder }).lean();
    const phase1Apps = await CandidateModel.find({ jobId })
      .populate("userId", "fullName email mobileNumber").lean();

    const normalized2 = phase2Apps.map((a) => normalizePhase2(a, job.title));
    const normalized1 = phase1Apps.map((c) => normalizePhase1(c, job.title));
    const merged = mergeApplicants(normalized2, normalized1, sortOrder);

    res.json({
      applicants: merged,
      total: merged.length,
      hasPlan: true,
      jobTitle: job.title,
    });
  } catch (err) {
    console.error("getApplicants error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── EMPLOYER: Get ALL applicants across ALL their jobs ────────
// This powers the /employer/applicants page (no jobId)
export const getEmployerAllApplicants = async (req, res) => {
  try {
    const { sortBy = "newest", search = "" } = req.query;
    const employerId = req.employer._id;
    const sortOrder = sortBy === "oldest" ? 1 : -1;

    // Get all jobs belonging to this employer
    const employerJobs = await Job.find({ employer: employerId })
      .select("_id title").lean();

    if (employerJobs.length === 0) {
      return res.json({ applicants: [], total: 0, hasPlan: true });
    }

    const jobIds = employerJobs.map((j) => j._id);
    const jobMap = {};
    employerJobs.forEach((j) => { jobMap[String(j._id)] = j.title; });

    // Phase 2 — Application model
    const phase2Apps = await Application.find({
      employer: employerId,
      job: { $in: jobIds },
    }).sort({ appliedAt: sortOrder }).lean();

    // Phase 1 — CandidateModel (all their jobs)
    const phase1Apps = await CandidateModel.find({ jobId: { $in: jobIds } })
      .populate("userId", "fullName email mobileNumber")
      .sort({ createdAt: sortOrder }).lean();

    const normalized2 = phase2Apps.map((a) =>
      normalizePhase2(a, jobMap[String(a.job)] || "")
    );
    const normalized1 = phase1Apps.map((c) =>
      normalizePhase1(c, jobMap[String(c.jobId)] || "")
    );

    let merged = mergeApplicants(normalized2, normalized1, sortOrder);

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      merged = merged.filter(
        (a) =>
          a.candidateName?.toLowerCase().includes(q) ||
          a.candidateEmail?.toLowerCase().includes(q) ||
          a.jobTitle?.toLowerCase().includes(q) ||
          a.location?.toLowerCase().includes(q) ||
          a.keySkills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    res.json({
      applicants: merged,
      total: merged.length,
      hasPlan: true,
    });
  } catch (err) {
    console.error("getEmployerAllApplicants error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── EMPLOYER: Update application status ─────────────────────
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Applied", "Shortlisted", "Rejected", "Contacted"];
    if (!valid.includes(status)) return res.status(400).json({ message: "Invalid status." });
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, employer: req.employer._id },
      { status },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: "Not found." });
    res.json({ message: "Status updated.", application });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── EMPLOYER: Dashboard stats ────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const employerId = req.employer._id;
    const jobs = await Job.find({ employer: employerId })
      .select("title applicantsCount applicationsCount status isAdminApproved postedBy")
      .lean();

    const totalActiveJobs = jobs.filter(
      (j) => j.status === "approved" && j.isAdminApproved
    ).length;
    const totalApplications = jobs.reduce(
      (sum, j) => sum + (j.applicantsCount || 0), 0
    );
    const recentApplications = await Application.find({ employer: employerId })
      .sort({ appliedAt: -1 }).limit(5).populate("job", "title").lean();

    const employer = await Employer.findById(employerId).lean();
    const FREE_JOB_LIMIT = 2;
    const totalPosted = jobs.length;
    const sub = employer?.subscription;
    const hasPaidPlan =
      sub?.plan && sub.plan !== "none" &&
      (!sub.expiresAt || new Date() < new Date(sub.expiresAt));

    res.json({
      totalActiveJobs,
      totalApplications,
      recentApplications,
      jobsWithCounts: jobs,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── ADMIN: Full access to applicants for one job ─────────────
export const adminGetApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId)
      .populate("employer", "companyName email").lean();
    if (!job) return res.status(404).json({ message: "Job not found." });

    const phase2 = await Application.find({ job: jobId })
      .populate("candidate", "fullName email mobileNumber").lean();
    const phase1 = await CandidateModel.find({ jobId })
      .populate("userId", "fullName email mobileNumber").lean();

    const normalized2 = phase2.map((a) => ({
      ...normalizePhase2(a, job.title),
      companyName: job.employer?.companyName || "",
    }));
    const normalized1 = phase1.map((c) => ({
      ...normalizePhase1(c, job.title),
      companyName: job.employer?.companyName || "",
    }));

    const merged = mergeApplicants(normalized2, normalized1);
    res.json({ applicants: merged, total: merged.length, jobTitle: job.title });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── ADMIN: All applications across all employer jobs ─────────
export const adminGetAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 30, search = "", status = "" } = req.query;

    const employerJobs = await Job.find({ postedBy: "employer" })
      .select("_id title employer")
      .populate("employer", "companyName email").lean();

    const jobIds = employerJobs.map((j) => j._id);
    const jobMap = {};
    employerJobs.forEach((j) => { jobMap[String(j._id)] = j; });

    const appQuery = { job: { $in: jobIds } };
    if (status) appQuery.status = status;

    const phase2Apps = await Application.find(appQuery)
      .populate("candidate", "fullName email mobileNumber")
      .sort({ appliedAt: -1 }).lean();
    const phase1Apps = await CandidateModel.find({ jobId: { $in: jobIds } })
      .populate("userId", "fullName email mobileNumber")
      .sort({ createdAt: -1 }).lean();

    const normalized2 = phase2Apps.map((a) => {
      const job = jobMap[String(a.job)];
      return {
        ...normalizePhase2(a, job?.title || ""),
        jobId: String(a.job),
        companyName: job?.employer?.companyName || "",
        employerEmail: job?.employer?.email || "",
      };
    });
    const normalized1 = phase1Apps.map((c) => {
      const job = jobMap[String(c.jobId)];
      return {
        ...normalizePhase1(c, job?.title || ""),
        jobId: String(c.jobId),
        companyName: job?.employer?.companyName || "",
        employerEmail: job?.employer?.email || "",
      };
    });

    const seen = new Set();
    let merged = [...normalized2, ...normalized1].filter((a) => {
      const key = `${a.candidateEmail?.toLowerCase()}-${a.jobId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (search) {
      const q = search.toLowerCase();
      merged = merged.filter(
        (a) =>
          a.candidateName.toLowerCase().includes(q) ||
          a.candidateEmail.toLowerCase().includes(q) ||
          a.jobTitle.toLowerCase().includes(q) ||
          a.companyName.toLowerCase().includes(q)
      );
    }

    merged.sort((a, b) =>
      new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );

    const total = merged.length;
    const paginated = merged.slice(
      (Number(page) - 1) * Number(limit),
      Number(page) * Number(limit)
    );

    res.json({ applications: paginated, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};







// import Application from "../models/Application.js";
// import CandidateModel from "../models/CandidateModel.js";
// import Job from "../models/job.js";
// import Employer from "../models/Employer.js";
// import { sendEmail } from "../utils/sendEmail.js";

// // ─── Candidate applies (Phase 2) ──────────────────────────────
// export const applyForJob = async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId).populate("employer");
//     if (!job || job.status !== "Active" || !job.isAdminApproved) {
//       return res.status(404).json({ message: "Job not found or not available." });
//     }

//     const alreadyApplied = await Application.findOne({
//       job: job._id,
//       candidate: req.user._id,
//     });
//     if (alreadyApplied) {
//       return res.status(400).json({ message: "You have already applied." });
//     }

//     const application = await Application.create({
//       job: job._id,
//       employer: job.employer._id,
//       candidate: req.user._id,
//       candidateName: req.user.fullName || req.body.candidateName || "",
//       candidateEmail: req.user.email || req.body.candidateEmail || "",
//       candidatePhone: req.body.candidatePhone || String(req.user.mobileNumber || ""),
//       experience: req.body.experience || "",
//       location: req.body.location || "",
//       education: req.body.education || "",
//       keySkills: req.body.keySkills || [],
//       resumeUrl: req.body.resumeUrl || "",
//     });

//     await Job.findByIdAndUpdate(job._id, {
//       $inc: { applicantsCount: 1, applicationsCount: 1 },
//     });

//     if (job.employer?.email) {
//       await sendEmail({
//         to: job.employer.email,
//         subject: `New Application for "${job.title}"`,
//         html: `<h2>New Application</h2><p>${application.candidateName} applied for ${job.title}</p>`,
//       });
//     }

//     res.status(201).json({ message: "Applied successfully.", application });
//   } catch (err) {
//     console.error("Apply error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── KEY FIX: Employer gets applicants from BOTH models ───────
// export const getApplicants = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { sortBy = "newest" } = req.query;
//     const employerId = req.employer._id;

//     // Step 1: Verify this job belongs to this employer
//     const job = await Job.findOne({ _id: jobId, employer: employerId });
//     if (!job) {
//       return res.status(404).json({ message: "Job not found." });
//     }

//     const sortOrder = sortBy === "oldest" ? 1 : -1;

//     // Step 2: Get Phase 2 applicants (Application model)
//     const phase2Apps = await Application.find({
//       job: jobId,
//       employer: employerId,
//     })
//       .sort({ appliedAt: sortOrder })
//       .lean();

//     // Step 3: Get Phase 1 applicants (CandidateModel)
//     // CandidateModel has jobId field — no employer field, just match jobId
//     const phase1Apps = await CandidateModel.find({ jobId: jobId })
//       .populate("userId", "fullName email mobileNumber")
//       .lean();

//     console.log(`[getApplicants] Job: ${jobId}`);
//     console.log(`[getApplicants] Phase2 count: ${phase2Apps.length}`);
//     console.log(`[getApplicants] Phase1 count: ${phase1Apps.length}`);

//     // Step 4: Normalize Phase 2 records
//     const normalized2 = phase2Apps.map((a) => ({
//       _id: String(a._id),
//       source: "phase2",
//       candidateName: a.candidateName || "Candidate",
//       candidateEmail: a.candidateEmail || "",
//       candidatePhone: a.candidatePhone || "",
//       experience: a.experience || "",
//       education: a.education || "",
//       location: a.location || "",
//       keySkills: Array.isArray(a.keySkills) ? a.keySkills : [],
//       resumeUrl: a.resumeUrl || "",
//       status: a.status || "Applied",
//       appliedAt: a.appliedAt || a.createdAt || new Date(),
//     }));

//     // Step 5: Normalize Phase 1 records
//     const normalized1 = phase1Apps.map((c) => {
//       const personalInfo = c.personalInfo || {};
//       const experiences = Array.isArray(c.experiences) ? c.experiences : [];
//       const education = Array.isArray(c.education) ? c.education : [];
//       const skills = Array.isArray(c.skills) ? c.skills : [];

//       return {
//         _id: String(c._id),
//         source: "phase1",
//         candidateName:
//           personalInfo.fullName ||
//           c.userId?.fullName ||
//           "Candidate",
//         candidateEmail:
//           personalInfo.email ||
//           c.userId?.email ||
//           "",
//         candidatePhone:
//           personalInfo.mobileNumbers ||
//           personalInfo.phone ||
//           String(c.userId?.mobileNumber || ""),
//         experience:
//           experiences.length > 0
//             ? `${experiences[0].jobTitle || experiences[0].role || ""} at ${experiences[0].company || ""}`.trim()
//             : "",
//         education:
//           education.length > 0
//             ? `${education[0].degree || ""} — ${education[0].institution || education[0].college || ""}`.trim()
//             : "",
//         location:
//           personalInfo.location ||
//           personalInfo.city ||
//           "",
//         keySkills: skills,
//         resumeUrl: c.resumeUrl || "",
//         status: "Applied",
//         appliedAt: c.createdAt || new Date(),
//       };
//     });

//     // Step 6: Merge — Phase 2 first, then Phase 1
//     // Deduplicate by email to avoid showing same person twice
//     const seen = new Set();
//     const merged = [];

//     for (const app of [...normalized2, ...normalized1]) {
//       const key = app.candidateEmail
//         ? app.candidateEmail.toLowerCase()
//         : app._id;
//       if (!seen.has(key)) {
//         seen.add(key);
//         merged.push(app);
//       }
//     }

//     // Step 7: Sort merged list
//     merged.sort((a, b) => {
//       const da = new Date(a.appliedAt).getTime();
//       const db = new Date(b.appliedAt).getTime();
//       return sortOrder === -1 ? db - da : da - db;
//     });

//     // Step 8: Check subscription
//     const employer = await Employer.findById(employerId).lean();
//     const hasPlan =
//       employer?.subscription?.plan &&
//       employer.subscription.plan !== "none" &&
//       (!employer.subscription.expiresAt ||
//         new Date() < new Date(employer.subscription.expiresAt));

//     // Step 9: Gate sensitive data
//     const gated = merged.map((app) => {
//       if (hasPlan) {
//         return { ...app, locked: false };
//       }
//       return {
//         ...app,
//         candidateEmail: "",
//         candidatePhone: "",
//         resumeUrl: null,
//         locked: true,
//       };
//     });

//     console.log(`[getApplicants] Total merged: ${merged.length}, hasPlan: ${hasPlan}`);

//     res.json({
//       applicants: gated,
//       total: merged.length,
//       hasPlan: !!hasPlan,
//       jobTitle: job.title,
//     });
//   } catch (err) {
//     console.error("getApplicants error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // ─── Update status (Phase 2 only) ─────────────────────────────
// export const updateApplicationStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const valid = ["Applied", "Shortlisted", "Rejected", "Contacted"];
//     if (!valid.includes(status)) {
//       return res.status(400).json({ message: "Invalid status." });
//     }
//     const application = await Application.findOneAndUpdate(
//       { _id: req.params.id, employer: req.employer._id },
//       { status },
//       { new: true }
//     );
//     if (!application) return res.status(404).json({ message: "Not found." });
//     res.json({ message: "Status updated.", application });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── Dashboard stats ──────────────────────────────────────────
// export const getDashboardStats = async (req, res) => {
//   try {
//     const employerId = req.employer._id;

//     const jobs = await Job.find({ employer: employerId })
//       .select("title applicantsCount applicationsCount status isAdminApproved postedBy")
//       .lean();

//     const totalActiveJobs = jobs.filter(
//       (j) => j.status === "approved" && j.isAdminApproved
//     ).length;

//     const totalApplications = jobs.reduce(
//       (sum, j) => sum + (j.applicantsCount || 0), 0
//     );

//     const recentApplications = await Application.find({ employer: employerId })
//       .sort({ appliedAt: -1 })
//       .limit(5)
//       .populate("job", "title")
//       .lean();

//     res.json({
//       totalActiveJobs,
//       totalApplications,
//       recentApplications,
//       jobsWithCounts: jobs,
//     });
//   } catch (err) {
//     console.error("Dashboard stats error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── Admin: full applicant access ─────────────────────────────
// export const adminGetApplicants = async (req, res) => {
//   try {
//     const { jobId } = req.params;

//     const phase2 = await Application.find({ job: jobId }).lean();
//     const phase1 = await CandidateModel.find({ jobId })
//       .populate("userId", "fullName email mobileNumber")
//       .lean();

//     const normalized2 = phase2.map((a) => ({
//       _id: String(a._id), source: "phase2",
//       candidateName: a.candidateName || "Candidate",
//       candidateEmail: a.candidateEmail || "",
//       candidatePhone: a.candidatePhone || "",
//       experience: a.experience || "",
//       education: a.education || "",
//       location: a.location || "",
//       keySkills: a.keySkills || [],
//       resumeUrl: a.resumeUrl || "",
//       status: a.status || "Applied",
//       appliedAt: a.appliedAt || a.createdAt,
//     }));

//     const normalized1 = phase1.map((c) => ({
//       _id: String(c._id), source: "phase1",
//       candidateName: c.personalInfo?.fullName || c.userId?.fullName || "Candidate",
//       candidateEmail: c.personalInfo?.email || c.userId?.email || "",
//       candidatePhone: c.personalInfo?.mobileNumbers || String(c.userId?.mobileNumber || ""),
//       experience: c.experiences?.[0] ? `${c.experiences[0].jobTitle || ""} at ${c.experiences[0].company || ""}` : "",
//       education: c.education?.[0] ? `${c.education[0].degree || ""} — ${c.education[0].institution || ""}` : "",
//       location: c.personalInfo?.location || "",
//       keySkills: c.skills || [],
//       resumeUrl: c.resumeUrl || "",
//       status: "Applied",
//       appliedAt: c.createdAt || new Date(),
//     }));

//     const seen = new Set();
//     const merged = [...normalized2, ...normalized1].filter((a) => {
//       const key = a.candidateEmail?.toLowerCase() || a._id;
//       if (seen.has(key)) return false;
//       seen.add(key);
//       return true;
//     });

//     merged.sort((a, b) =>
//       new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
//     );

//     res.json({ applicants: merged, total: merged.length });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };