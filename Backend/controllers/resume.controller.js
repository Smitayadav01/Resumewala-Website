import Resume from "../models/resume.model.js";
import { parseResumeWithAI } from "../services/ai.service.js";
import { extractTextFromPDF } from "../services/pdf.service.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

export const uploadResume = async (req, res) => {
  try {
    // ✅ OPTIONAL USER
    let userId = null;

    if (req.user && req.user._id) {
      userId = req.user._id;
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resume file required" });
    }

    // 1️⃣ Extract text
    const text = await extractTextFromPDF(req.file.buffer);

    // 2️⃣ AI parse
    const parsedData = await parseResumeWithAI(text);

    // 3️⃣ Upload to cloudinary
    const uploadId = userId || `guest_${Date.now()}`;

    const uploaded = await uploadToCloudinary(
      req.file.buffer,
      uploadId
    );

    /* ================= LOGGED-IN USER ================= */
    if (userId) {
      const existingResume = await Resume.findOne({ userId });

      // delete old
      if (existingResume?.resumeFile?.publicId) {
        await cloudinary.uploader.destroy(
          existingResume.resumeFile.publicId,
          { resource_type: "raw" }
        );
      }

      const resume = await Resume.findOneAndUpdate(
        { userId },
        {
          $set: {
            personal: parsedData.personal,
            skills: parsedData.skills,
            experience: parsedData.experience,
            education: parsedData.education,
            resumeFile: {
              url: uploaded.secure_url,
              publicId: uploaded.public_id,
              uploadedAt: new Date(),
            },
          },
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Resume uploaded successfully",
        resume,
        guest: false,
      });
    }

    /* ================= GUEST USER ================= */

    return res.status(200).json({
      success: true,
      guest: true,
      message: "Resume parsed successfully (guest)",
      resume: {
        personal: parsedData.personal,
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        resumeFile: {
          url: uploaded.secure_url,
        },
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Resume upload failed" });
  }
};