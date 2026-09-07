import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    // ─── Phase 1 Admin Fields (keep exactly as is) ────────────
    title: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    location: { type: String, default: "" },
    experience: { type: String, default: "" },
    qualification: { type: String, default: "" },
    description: { type: String, default: "" },
    requirements: [{ type: String }],
    salary: { type: String, default: "" },
    jobType: { type: String, default: "Full-time" },
    postedDate: { type: Date, default: Date.now },

    // ─── Who posted this job ───────────────────────────────────
    // null = admin posted, ObjectId = employer posted
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      default: null,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      default: null,
    },
    postedBy: {
      type: String,
      enum: ["admin", "employer"],
      default: "admin", // ✅ existing jobs are admin-posted
    },

    // ─── Phase 2 Employer Job Fields ──────────────────────────
    experienceRequired: { type: String, default: "" },
    industryCategory: { type: String, default: "" },
    employmentType: {
      type: String,
      enum: ["Full Time", "Part Time", "Contract", ""],
      default: "",
    },
    workMode: {
      type: String,
      enum: ["Onsite", "Hybrid", "Remote", ""],
      default: "",
    },
    keySkills: [{ type: String }],
    numberOfOpenings: { type: Number, default: 1 },
    expiryDate: { type: Date },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    educationQualification: { type: String, default: "" },
    interviewProcess: { type: String, default: "" },
    agePreference: { type: String, default: "" },

    // ─── Approval Status ──────────────────────────────────────
    // Admin jobs: status = "Active", isAdminApproved = true (default)
    // Employer jobs: status = "pending" → "approved" / "rejected"
    status: {
      type: String,
      enum: ["Draft", "Active", "Closed", "pending", "approved", "rejected"],
      default: "Active", // ✅ existing admin jobs stay Active
    },
    isAdminApproved: {
      type: Boolean,
      default: true, // ✅ existing jobs are already approved
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },

    // ─── Counts ───────────────────────────────────────────────
    applicationsCount: { type: Number, default: 0 },
    applicantsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);