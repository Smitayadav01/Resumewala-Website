import Resume from "../models/resume.model.js";
import { parseResumeWithAI } from "../services/ai.service.js";
import { extractTextFromPDF } from "../services/pdf.service.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import cloudinary from "../config/cloudinary.js";

export const uploadResume = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "Resume file required" });
    }

    // 1️⃣ Extract text
    const text = await extractTextFromPDF(req.file.buffer);

    // 2️⃣ AI parse
    const parsedData = await parseResumeWithAI(text);

    // 3️⃣ Upload to cloudinary
    const uploaded = await uploadToCloudinary(req.file.buffer, userId);

    // 4️⃣ Check if resume exists
    const existingResume = await Resume.findOne({ userId });

    // 5️⃣ Delete old file if exists
    if (existingResume?.resumeFile?.publicId) {
      await cloudinary.uploader.destroy(
        existingResume.resumeFile.publicId,
        { resource_type: "raw" }
      );
    }

    // 6️⃣ Replace or create (UPSERT)
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

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Resume upload failed" });
  }
};