const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  plan: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
  amount: { type: Number, required: true }, // in paise (INR)
  currency: { type: String, default: 'INR' },

  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },

  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created',
  },

  jobCreditsGranted: { type: Number, default: 0 },
  validityDays: { type: Number, default: 30 },
  paidAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);