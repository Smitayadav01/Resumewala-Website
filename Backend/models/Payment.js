import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true },
    plan: { type: String, enum: ["basic", "standard", "premium"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    jobCredits: { type: Number },
    validityDays: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);