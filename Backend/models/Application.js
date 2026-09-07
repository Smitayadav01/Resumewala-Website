import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    candidateName: { type: String, default: "" },
    candidateEmail: { type: String, default: "" },
    candidatePhone: { type: String, default: "" },
    experience: { type: String, default: "" },
    education: { type: String, default: "" },
    location: { type: String, default: "" },
    keySkills: [{ type: String }],
    resumeUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Rejected", "Contacted"],
      default: "Applied",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);