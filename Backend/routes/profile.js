import {upload} from "../middlewares/uploadMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireAuth from "../middlewares/requireAuth.js";
import { 
  uploadResume, 
  getProfile, 
  EditProfile, 
  downloadResume,
  saveGuestProfile
} from "../controllers/profileController.js";
import { Router } from "express";

const router = Router();

router.post(
  "/upload-resume",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

router.get("/", authMiddleware,requireAuth, getProfile);

router.put("/", authMiddleware, EditProfile);
router.post(
  "/save-guest",
  authMiddleware,
  requireAuth,
  saveGuestProfile
);

// router.get(
//   "/download-resume/:id",
//   authMiddleware,
//   downloadResume
// );

export default router;
