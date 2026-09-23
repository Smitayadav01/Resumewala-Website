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
      default: "professional",
    },
    message: { type: String, default: "" },
    // ✅ Cloudinary fields — replaces local file storage
    resumeUrl: { type: String, default: "" },      // Cloudinary secure_url
    resumePublicId: { type: String, default: "" },  // for later deletion if needed
    resumeFileName: { type: String, default: "" },  // original filename for display

    resumeFile: { type: String, default: "" },

    // Payment
    amount: { type: Number, default: 99 },           // ✅ ₹99
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // Admin
    status: {
      type: String,
      enum: ["new", "contacted", "in_progress", "delivered", "cancelled"],
      default: "new",
    },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ResumeOrder", resumeOrderSchema);