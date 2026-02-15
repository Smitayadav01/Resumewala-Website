import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    personalInfo: { type: Object, required: true },
    experiences: { type: Array, default: [] },
    education: { type: Array, default: [] },
    skills: { type: Array, default: [] },
    resumeUrl: { type: String },
  },
  { timestamps: true }
);

const CandidateModel = mongoose.model("Candidate", candidateSchema);

export default CandidateModel;
