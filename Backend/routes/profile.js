import upload from "../middlewares/uploadMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { uploadResume, getProfile, EditProfile } 
from "../controllers/profileController.js";
import { Router } from "express";

const router = Router();

router.post(
  "/upload-resume",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

export default router;