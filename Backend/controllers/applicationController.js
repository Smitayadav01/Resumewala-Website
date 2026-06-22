const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');
const { emailTemplates } = require('../utils/emailTemplates');

// ─── CANDIDATE: APPLY TO JOB ──────────────────────────────────
exports.applyToJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, status: 'Active', isAdminApproved: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or no longer active.' });

    const candidate = await User.findById(req.user._id);
    if (!candidate) return res.status(404).json({ success: false, message: 'User not found.' });

    // Check duplicate
    const existing = await Application.findOne({ job: job._id, candidate: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: 'You have already applied to this job.' });

    const application = await Application.create({
      job: job._id,
      employer: job.employer,
      candidate: req.user._id,
      candidateName: candidate.name || candidate.fullName || '',
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone || candidate.mobile || '',
      candidateLocation: candidate.location || '',
      candidateExperience: candidate.experience || '',
      candidateSkills: candidate.skills || [],
      resumeUrl: candidate.resume || candidate.resumeUrl || '',
    });

    // Increment job counter
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    // Notify employer
    const populatedJob = await Job.findById(job._id).populate('employer', 'email recruiterName companyName');
    if (populatedJob?.employer?.email) {
      await sendEmail({
        to: populatedJob.employer.email,
        subject: `New Application – ${job.jobTitle}`,
        html: emailTemplates.newApplication(
          populatedJob.employer.recruiterName,
          application.candidateName,
          job.jobTitle
        ),
      }).catch(console.error);
    }

    // Confirm to candidate
    await sendEmail({
      to: candidate.email,
      subject: `Application Submitted – ${job.jobTitle}`,
      html: emailTemplates.applicationConfirmation(candidate.name || candidate.fullName, job.jobTitle, populatedJob?.employer?.companyName),
    }).catch(console.error);

    res.status(201).json({ success: true, message: 'Application submitted successfully.', application });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Already applied.' });
    console.error('applyToJob error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── EMPLOYER: GET APPLICANTS FOR A JOB ───────────────────────
exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, employer: req.employer._id });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const { status, experience, skills, dateFrom, page = 1, limit = 20 } = req.query;
    const filter = { job: job._id };

    if (status) filter.status = status;
    if (dateFrom) filter.appliedAt = { $gte: new Date(dateFrom) };
    if (skills) filter.candidateSkills = { $in: skills.split(',').map(s => s.trim()) };

    const applications = await Application.find(filter)
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Application.countDocuments(filter);

    res.json({ success: true, applications, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── EMPLOYER: UPDATE APPLICATION STATUS ──────────────────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['Applied', 'Shortlisted', 'Rejected', 'Contacted'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' });

    const application = await Application.findOne({ _id: req.params.appId, employer: req.employer._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    application.status = status;
    if (notes !== undefined) application.notes = notes;
    await application.save();

    res.json({ success: true, message: 'Status updated.', application });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── EMPLOYER: ALL APPLICATIONS (ACROSS ALL JOBS) ─────────────
exports.getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { employer: req.employer._id };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('job', 'jobTitle jobLocation');

    const total = await Application.countDocuments(filter);

    res.json({ success: true, applications, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── CANDIDATE: MY APPLICATIONS ───────────────────────────────
exports.getCandidateApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .sort({ appliedAt: -1 })
      .populate('job', 'jobTitle jobLocation employmentType workMode status')
      .populate('employer', 'companyName companyLogo');

    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};