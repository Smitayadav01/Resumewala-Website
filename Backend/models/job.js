import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  experience: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  salary: { type: String },
  jobType: { type: String, default: "Full-time" },
  postedDate: { type: Date, default: Date.now }
});

export default mongoose.model("Job", jobSchema);

