// import mongoose, { Schema } from "mongoose";

// const EmployerSchema = new Schema({
//     userId:{ type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
//     companyId: { type: Schema.Types.ObjectId, ref: "Company"},
//     designation: String,
//     role: {
//         type: String,
//         enum: [ "admin", "member"],
//         default: "member"
//     },
    
// }, { timestamps: true });

// const EmployerModel = mongoose.model("Employer", EmployerSchema);

// export default EmployerModel;











const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employerSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  recruiterName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  companyLocation: { type: String, required: true },
  companyWebsite: { type: String, default: '' },

  // Company Profile
  companyLogo: { type: String, default: '' },
  companyDescription: { type: String, default: '' },
  industryType: { type: String, default: '' },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10',
  },

  // Verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: '' },
  emailVerificationExpires: { type: Date },

  // Admin approval
  isApproved: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  isVerifiedBadge: { type: Boolean, default: false },

  // Password reset
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date },

  // Subscription
  subscription: {
    plan: { type: String, enum: ['none', 'basic', 'standard', 'premium'], default: 'none' },
    jobCredits: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    activatedAt: { type: Date, default: null },
  },

  profileCompletionPercent: { type: Number, default: 0 },
}, { timestamps: true });

// Hash password before save
employerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

employerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

employerSchema.methods.calculateProfileCompletion = function () {
  const fields = [
    this.companyName, this.recruiterName, this.email, this.mobile,
    this.companyLocation, this.companyLogo, this.companyDescription,
    this.industryType, this.companySize,
  ];
  const filled = fields.filter(f => f && f.toString().trim() !== '').length;
  this.profileCompletionPercent = Math.round((filled / fields.length) * 100);
};

module.exports = mongoose.model('Employer', employerSchema);