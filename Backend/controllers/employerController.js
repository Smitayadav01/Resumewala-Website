const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');
const { emailTemplates } = require('../utils/emailTemplates');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

const generateToken = (id, role = 'employer') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── REGISTER ───────────────────────────────────────────────
exports.registerEmployer = async (req, res) => {
  try {
    const { companyName, recruiterName, email, mobile, companyLocation, companyWebsite, password } = req.body;

    if (!companyName || !recruiterName || !email || !mobile || !companyLocation || !password) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    const existing = await Employer.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered.' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs

    const employer = await Employer.create({
      companyName, recruiterName,
      email: email.toLowerCase(),
      mobile, companyLocation,
      companyWebsite: companyWebsite || '',
      password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL}/employer/verify-email/${verificationToken}`;
    await sendEmail({
      to: employer.email,
      subject: 'Verify your Resumewala Employer account',
      html: emailTemplates.employerVerification(employer.recruiterName, verifyUrl),
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email to continue.',
    });
  } catch (err) {
    console.error('registerEmployer error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── VERIFY EMAIL ────────────────────────────────────────────
exports.verifyEmployerEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const employer = await Employer.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });
    if (!employer) return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });

    employer.isEmailVerified = true;
    employer.emailVerificationToken = '';
    employer.emailVerificationExpires = undefined;
    await employer.save();

    res.json({ success: true, message: 'Email verified! Awaiting admin approval.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────
exports.loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required.' });

    const employer = await Employer.findOne({ email: email.toLowerCase() });
    if (!employer) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    if (!employer.isEmailVerified)
      return res.status(403).json({ success: false, message: 'Please verify your email first.' });
    if (!employer.isApproved)
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
    if (employer.isBlocked)
      return res.status(403).json({ success: false, message: 'Your account has been suspended.' });

    const isMatch = await employer.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = generateToken(employer._id);

    res.json({
      success: true,
      token,
      employer: {
        _id: employer._id,
        companyName: employer.companyName,
        recruiterName: employer.recruiterName,
        email: employer.email,
        companyLogo: employer.companyLogo,
        isVerifiedBadge: employer.isVerifiedBadge,
        subscription: employer.subscription,
        profileCompletionPercent: employer.profileCompletionPercent,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employer = await Employer.findOne({ email: email.toLowerCase() });
    if (!employer) return res.status(404).json({ success: false, message: 'No employer with that email.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    employer.resetPasswordToken = resetToken;
    employer.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hr
    await employer.save();

    const resetUrl = `${process.env.FRONTEND_URL}/employer/reset-password/${resetToken}`;
    await sendEmail({
      to: employer.email,
      subject: 'Reset your Resumewala password',
      html: emailTemplates.passwordReset(employer.recruiterName, resetUrl),
    });

    res.json({ success: true, message: 'Password reset email sent.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const employer = await Employer.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!employer) return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });

    employer.password = password;
    employer.resetPasswordToken = '';
    employer.resetPasswordExpires = undefined;
    await employer.save();

    res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET EMPLOYER PROFILE ─────────────────────────────────────
exports.getEmployerProfile = async (req, res) => {
  try {
    const employer = await Employer.findById(req.employer._id).select('-password -emailVerificationToken -resetPasswordToken');
    if (!employer) return res.status(404).json({ success: false, message: 'Employer not found.' });
    res.json({ success: true, employer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── UPDATE EMPLOYER PROFILE ──────────────────────────────────
exports.updateEmployerProfile = async (req, res) => {
  try {
    const allowedFields = [
      'companyName', 'recruiterName', 'mobile', 'companyLocation',
      'companyWebsite', 'companyDescription', 'industryType', 'companySize',
    ];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    // Handle logo upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'employer-logos');
      updates.companyLogo = result.secure_url;
    }

    const employer = await Employer.findByIdAndUpdate(req.employer._id, updates, { new: true }).select('-password');
    employer.calculateProfileCompletion();
    await employer.save();

    res.json({ success: true, message: 'Profile updated.', employer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── EMPLOYER DASHBOARD STATS ─────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const employerId = req.employer._id;

    const [totalActiveJobs, totalApplications, recentApplications, employer] = await Promise.all([
      Job.countDocuments({ employer: employerId, status: 'Active' }),
      Application.countDocuments({ employer: employerId }),
      Application.find({ employer: employerId })
        .sort({ appliedAt: -1 })
        .limit(10)
        .populate('job', 'jobTitle')
        .select('candidateName candidateLocation appliedAt status job'),
      Employer.findById(employerId).select('profileCompletionPercent subscription isVerifiedBadge companyName companyLogo'),
    ]);

    res.json({
      success: true,
      stats: {
        totalActiveJobs,
        totalApplications,
        recentApplications,
        profileCompletionPercent: employer.profileCompletionPercent,
        subscription: employer.subscription,
        isVerifiedBadge: employer.isVerifiedBadge,
        companyName: employer.companyName,
        companyLogo: employer.companyLogo,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};