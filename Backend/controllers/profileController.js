import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { extractResumeText } from "../utils/pdf.js";
import { parseResumeWithAI } from "../utils/aiParser.js";
import { uploadResumeToCloudinary } from "../utils/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";
import https from "https";

/* ================= UPLOAD / REPLACE RESUME ================= */

const uploadResume = async (req, res) => {
  try {
    console.log("HEADERS:", req.headers.authorization);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file required"
      });
    }

    // ✅ STEP 1 — extract text
    let text = "";

    try {
      text = await extractResumeText(req.file);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to read resume file",
      });
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only PDF or DOCX files are allowed",
      });
    }
    const aiParsed = await parseResumeWithAI(text);

    const parsedSkills = aiParsed.skills || [];
    const parsedExperience = aiParsed.experience || [];
    const parsedEducation = aiParsed.education || [];
    const parsedPersonal = aiParsed.personal || {};
    const previousPublicId = req.body.previousPublicId;

    if (previousPublicId) {
      await cloudinary.uploader.destroy(previousPublicId, {
          resource_type: "raw"
      });
    }

    // ✅ STEP 3 — upload cloudinary
    const uploadId =
      req.user?._id || `guest_${Date.now()}`;

    const result = await uploadResumeToCloudinary(
      req.file.buffer,
      uploadId
    );

    const resumeData = {
      url: result.secure_url,
      publicId: result.public_id,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    // ✅ STEP 4 — RETURN ONLY
    if (!req.user) {
  return res.status(200).json({
    success: true,
    guest: true,
    profile: {
      personal: parsedPersonal,
      skills: parsedSkills,
      experience: parsedExperience,
      education: parsedEducation,
      resume: resumeData,
    },
  });
}

// ============================
// ✅ CASE 2: LOGGED-IN USER
// ============================

const userId = req.user._id;
console.log("My USer:", userId)

// check if profile exists
const existingProfile = await Profile.findOne({ userId });

// ⭐ delete old resume if exists
if (existingProfile?.resume?.publicId) {
  await cloudinary.uploader.destroy(
    existingProfile.resume.publicId,
    { resource_type: "raw" }
  );
}

// ✅ create/update profile
  const updatedProfile = await Profile.findOneAndUpdate(
    { userId },
    {
      $set: {
        personal: parsedPersonal,
        skills: parsedSkills,
        experience: parsedExperience,
        education: parsedEducation,
        resume: resumeData,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
  console.log(updatedProfile)

  return res.status(200).json({
    success: true,
    guest: false,
    profile: updatedProfile,
  });

    } catch (error) {
      console.error("Resume upload error:", error);
      res.status(500).json({
        success: false,
        message: "Resume parsing failed"
      });
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
/* ================= DOWNLOAD RESUME ================= */

const downloadResume = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

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

const saveGuestProfile = async (req, res) => {
  try {
   if (!req.user) {
  return res.status(401).json({ message: "Login required" });
}

const userId = req.user._id;

    const data = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: data },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save profile" });
  }
};

const completeGuestProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      personal,
      skills,
      experience,
      education,
      resume
    } = req.body;

    const existingProfile = await Profile.findOne({ userId });

    // ⭐ If already has resume → delete old
    if (existingProfile?.resume?.publicId) {
      await cloudinary.uploader.destroy(
        existingProfile.resume.publicId,
        { resource_type: "raw" }
      );
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      {
        personal,
        skills,
        experience,
        education,
        resume,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      profile
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to complete profile"
    });
  }
};

export {
  uploadResume,
  getProfile,
  EditProfile,
  downloadResume,
  saveGuestProfile,
  completeGuestProfile,
};