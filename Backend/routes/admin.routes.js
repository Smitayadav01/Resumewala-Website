const express = require('express');
const router = express.Router();
const {
  getAllEmployers, approveEmployer, blockEmployer, grantVerifiedBadge,
  adminGetAllJobs, adminApproveJob, adminDeleteJob, adminDashboard,
} = require('../controllers/adminController');
const { adminGetAllPayments } = require('../controllers/paymentController');
const { requireAuth } = require('../middlewares/requireAuth');
const { roleMiddleware } = require('../middlewares/roleMiddleware'); // existing

// All admin routes require auth + admin role
router.use(requireAuth, roleMiddleware('admin'));

// Dashboard
router.get('/dashboard', adminDashboard);

// Employer management
router.get('/employers', getAllEmployers);
router.put('/employers/:id/approve', approveEmployer);
router.put('/employers/:id/block', blockEmployer);
router.put('/employers/:id/verify-badge', grantVerifiedBadge);

// Job management
router.get('/jobs', adminGetAllJobs);
router.put('/jobs/:id/approve', adminApproveJob);
router.delete('/jobs/:id', adminDeleteJob);

// Payment management
router.get('/payments', adminGetAllPayments);

module.exports = router;