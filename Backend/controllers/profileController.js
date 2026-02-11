import Profile from "../models/Profile.js";
import { extractTextFromPDF } from "../utils/pdf.js";
import {
  extractSkills,
  extractExperience,
  extractEducation
} from "../utils/parser.js";
import { uploadResumeToCloudinary } from "../utils/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";

const uploadResume = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "Resume file required" });
    }

    console.log("File buffer length:", req.file.buffer.length);


    const text = await extractTextFromPDF(req.file.buffer);

    const result = await uploadResumeToCloudinary(req.file.buffer, userId);

    const resumeData = {
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date()
    };

    const profileData = {
      userId,
      resume: resumeData,
      skills: extractSkills(text),
      experience: extractExperience(text),
      education: extractEducation(text)
    };

    const existingProfile = await Profile.findOne({ userId });

    if (existingProfile?.resume?.publicId) {
      await cloudinary.uploader.destroy(existingProfile.resume.publicId, {
        resource_type: "raw"
      });
    }
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: profileData },
      { upsert: true, new: true }
    );

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



const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOne({ userId });
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to retrieve profile" });
  }
};

const EditProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Edit profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export { uploadResume, getProfile, EditProfile };
