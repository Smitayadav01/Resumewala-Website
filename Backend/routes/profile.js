import {upload} from "../middlewares/uploadMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireAuth from "../middlewares/requireAuth.js";
import { 
  uploadResume, 
  getProfile, 
  EditProfile, 
  downloadResume,
  saveGuestProfile,
  completeGuestProfile
} from "../controllers/profileController.js";
import { Router } from "express";
import optionalAuth from "../middlewares/optionalMiddleware.js";

const router = Router();

router.post(
  "/upload-resume",
  optionalAuth,
  upload.single("resume"),
  uploadResume
);

router.get("/", authMiddleware,requireAuth, getProfile);

router.put("/", authMiddleware, EditProfile);
router.post(
  "/complete-guest",
  authMiddleware,
  completeGuestProfile
);

// router.get(
//   "/download-resume/:id",
//   authMiddleware,
//   downloadResume
// );

export default router;
