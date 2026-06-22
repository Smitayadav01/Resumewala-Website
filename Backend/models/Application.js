const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Candidate snapshot at apply time
  candidateName: { type: String },
  candidateEmail: { type: String },
  candidatePhone: { type: String },
  candidateLocation: { type: String },
  candidateExperience: { type: String },
  candidateSkills: [{ type: String }],
  resumeUrl: { type: String, default: '' },

  // Status
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Rejected', 'Contacted'],
    default: 'Applied',
  },

  appliedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);