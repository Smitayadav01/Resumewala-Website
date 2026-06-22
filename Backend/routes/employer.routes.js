// employer.routes.js
const express = require('express');
const router = express.Router();
const {
  registerEmployer, verifyEmployerEmail, loginEmployer,
  forgotPassword, resetPassword, getEmployerProfile,
  updateEmployerProfile, getDashboardStats,
} = require('../controllers/employerController');
const {
  createJob, getMyJobs, getJobById, updateJob, deleteJob, duplicateJob,
  getPublicJobs, getPublicJobById,
} = require('../controllers/jobController');
const {
  applyToJob, getJobApplicants, updateApplicationStatus,
  getAllApplications, getCandidateApplications,
} = require('../controllers/applicationController');
const {
  createOrder, verifyPayment, getPaymentHistory,
} = require('../controllers/paymentController');
const { requireEmployerAuth } = require('../middlewares/employerAuthMiddleware');
const { requireAuth } = require('../middlewares/requireAuth'); // existing candidate auth
const upload = require('../middlewares/uploadMiddleware');

// ── PUBLIC ────────────────────────────────────────────────────
router.post('/register', registerEmployer);
router.get('/verify-email/:token', verifyEmployerEmail);
router.post('/login', loginEmployer);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Public job routes
router.get('/jobs/public', getPublicJobs);
router.get('/jobs/public/:id', getPublicJobById);

// ── EMPLOYER PROTECTED ────────────────────────────────────────
router.get('/profile', requireEmployerAuth, getEmployerProfile);
router.put('/profile', requireEmployerAuth, upload.single('companyLogo'), updateEmployerProfile);
router.get('/dashboard', requireEmployerAuth, getDashboardStats);

// Job management
router.post('/jobs', requireEmployerAuth, createJob);
router.get('/jobs', requireEmployerAuth, getMyJobs);
router.get('/jobs/:id', requireEmployerAuth, getJobById);
router.put('/jobs/:id', requireEmployerAuth, updateJob);
router.delete('/jobs/:id', requireEmployerAuth, deleteJob);
router.post('/jobs/:id/duplicate', requireEmployerAuth, duplicateJob);

// Applicant management
router.get('/jobs/:jobId/applicants', requireEmployerAuth, getJobApplicants);
router.put('/applications/:appId/status', requireEmployerAuth, updateApplicationStatus);
router.get('/applications', requireEmployerAuth, getAllApplications);

// Payments
router.post('/payment/create-order', requireEmployerAuth, createOrder);
router.post('/payment/verify', requireEmployerAuth, verifyPayment);
router.get('/payment/history', requireEmployerAuth, getPaymentHistory);

// ── CANDIDATE PROTECTED ───────────────────────────────────────
router.post('/jobs/:jobId/apply', requireAuth, applyToJob);
router.get('/my-applications', requireAuth, getCandidateApplications);

module.exports = router;