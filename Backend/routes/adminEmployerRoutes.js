import express from "express";
import {
  getAllEmployers, approveEmployer, blockEmployer,
  verifyEmployer, getAllPayments, getPendingJobs,
  approveJob, rejectJob, setEmployerPlan,
} from "../controllers/adminEmployerController.js";
import {
  adminGetApplicants,
  adminGetAllApplications,
} from "../controllers/applicationController.js";

const router = express.Router();

// Employers
router.get("/employers", getAllEmployers);
router.patch("/employers/:id/approve", approveEmployer);
router.patch("/employers/:id/block", blockEmployer);
router.patch("/employers/:id/verify", verifyEmployer);
router.patch("/employers/:id/set-plan", setEmployerPlan);

// Payments
router.get("/payments", getAllPayments);

// Job approval
router.get("/jobs/pending", getPendingJobs);
router.patch("/jobs/:id/approve", approveJob);
router.patch("/jobs/:id/reject", rejectJob);

// ✅ Admin application access
router.get("/jobs/:jobId/applicants", adminGetApplicants);
router.get("/applications", adminGetAllApplications);

export default router;