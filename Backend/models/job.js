import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref:"Company" },
  employerId:{type:mongoose.Schema.Types.ObjectId, ref:"Employer"},
  location: { type: String, required: true },
  experience: { type: String, required: true },
  qualification: { type: String },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  salary: { type: String },
  jobType: { type: String, default: "Full-time" },
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Closed'],
    default: 'Draft',
  },

  // Counts
  applicationsCount: { type: Number, default: 0 },

  // Admin approval
  isAdminApproved: { type: Boolean, default: true }, // set false if approval needed
  postedDate: { type: Date, default: Date.now }
},{timestamps:true});

export default mongoose.model("Job", jobSchema);

