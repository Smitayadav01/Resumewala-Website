import mongoose from "mongoose";

const resumeOrderSchema = new mongoose.Schema(
  {
    // ==========================================
    // CUSTOMER DETAILS
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // RESUME PACKAGE
    // ==========================================

    package: {
      type: String,
      enum: ["professional"],
      default: "professional",
      required: true,
    },

    // ==========================================
    // UPLOADED RESUME
    // ==========================================

    resumeFile: {
      type: String,
      default: "",
    },

    // ==========================================
    // ORDER STATUS
    // ==========================================

    status: {
      type: String,

      enum: [
        "new",
        "contacted",
        "in_progress",
        "delivered",
        "cancelled",
      ],

      default: "new",
    },

    adminNotes: {
      type: String,
      default: "",
    },

    // ==========================================
    // PAYMENT
    // ==========================================

    paymentStatus: {
      type: String,

      enum: [
        "pending",
        "paid",
        "refunded",
      ],

      default: "pending",
    },

    // Amount in INR
    amount: {
      type: Number,
      default: 499,
    },

    // ==========================================
    // RAZORPAY DETAILS
    // ==========================================

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ResumeOrder",
  resumeOrderSchema
);