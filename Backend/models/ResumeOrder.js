import mongoose from "mongoose";

const resumeOrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, required: true },
    experience: { type: String, default: "" },
    targetRole: { type: String, required: true },
    package: {
      type: String,
      enum: ["basic", "professional", "linkedin"],
      required: true,
    },
    message: { type: String, default: "" },
    resumeFile: { type: String, default: "" }, // filename or cloudinary URL
    status: {
      type: String,
      enum: ["new", "contacted", "in_progress", "delivered", "cancelled"],
      default: "new",
    },
    adminNotes: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("ResumeOrder", resumeOrderSchema);