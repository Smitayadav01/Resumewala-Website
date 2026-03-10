import upload from "../middlewares/uploadMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { 
  uploadResume, 
  getProfile, 
  EditProfile, 
  downloadResume 
} from "../controllers/profileController.js";
import { Router } from "express";

const router = Router();

router.post(
  "/upload-resume",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

router.get("/", authMiddleware, getProfile);

router.put("/", authMiddleware, EditProfile);

// router.get(
//   "/download-resume/:id",
//   authMiddleware,
//   downloadResume
// );

export default router;
