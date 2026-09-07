import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const employerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    recruiterName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    companyLocation: { type: String, required: true },
    companyWebsite: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
    companyDescription: { type: String, default: "" },
    industryType: { type: String, default: "" },
    companySize: { type: String, default: "" },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },

    isApproved: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    subscription: {
      plan: {
        type: String,
        enum: ["none", "basic", "standard", "premium"],
        default: "none",
      },
      jobCredits: { type: Number, default: 0 },
      expiresAt: { type: Date, default: null },
      razorpayPaymentId: { type: String, default: "" },
      razorpayOrderId: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Mongoose 7+ supports async pre hooks without next()
employerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

employerSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Employer", employerSchema);