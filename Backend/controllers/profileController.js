import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { extractTextFromPDF } from "../utils/pdf.js";
import {
  extractSkills,
  extractExperience,
  extractEducation
} from "../utils/parser.js";
import { uploadResumeToCloudinary } from "../utils/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";
import https from "https";

/* ================= UPLOAD / REPLACE RESUME ================= */

const uploadResume = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    let personal = {
      fullName: user.fullName,
      email: user.email,
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resume file required" });
    }

    const text = await extractTextFromPDF(req.file.buffer);

    // Upload new resume first
    const result = await uploadResumeToCloudinary(req.file.buffer, userId);



    const resumeData = {
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date()
    };

    const parsedSkills = extractSkills(text);
    const parsedExperience = extractExperience(text);
    const parsedEducation = extractEducation(text);

    const existingProfile = await Profile.findOne({ userId });

    // Merge instead of overwrite
    const mergedExperience = [
      ...(existingProfile?.experience || []),
      ...parsedExperience
    ];

    const mergedEducation = [
      ...(existingProfile?.education || []),
      ...parsedEducation
    ];

    const profile = await Profile.findOneAndUpdate(
      { userId },
      {
        $set: {
          personal,
          resume: resumeData,
          skills: parsedSkills,
          experience: mergedExperience,
          education: mergedEducation
        }
      },
      { upsert: true, new: true }
    );

    // Delete old resume AFTER successful update
    if (existingProfile?.resume?.publicId) {
      await cloudinary.uploader.destroy(
        existingProfile.resume.publicId,
        { resource_type: "raw" }
      );
    }

    res.status(200).json({
      success: true,
      resumeUrl: result.secure_url,
      profile
    });

  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ message: "Resume parsing failed" });
  }
};

/* ================= GET PROFILE ================= */

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ success: true, profile });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to retrieve profile" });
  }
};

/* ================= EDIT PROFILE (NO RESUME) ================= */

const EditProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const updates = {};

    /* ---------- PERSONAL (PARTIAL UPDATE) ---------- */
    if (req.body.personal && typeof req.body.personal === "object") {
      for (const key in req.body.personal) {
        updates[`personal.${key}`] = req.body.personal[key];
      }
    }

    /* ---------- TOP-LEVEL FIELDS ---------- */
    const allowedTopLevel = [
      "skills",
      "experience",
      "education",
      "profileVisible"
    ];

    for (const key of allowedTopLevel) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, profile });

  } catch (error) {
    console.error("Edit profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};


/* ================= DOWNLOAD RESUME ================= */

const downloadResume = async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await Profile.findOne({ userId });

    if (!profile?.resume?.url) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=resume.pdf"
    );
    res.setHeader("Content-Type", "application/pdf");

    https.get(profile.resume.url, (cloudRes) => {
      cloudRes.pipe(res);
    });

  } catch (error) {
    console.error("Resume download error:", error);
    res.status(500).json({ message: "Failed to download resume" });
  }
};

export {
  uploadResume,
  getProfile,
  EditProfile,
  downloadResume
};
