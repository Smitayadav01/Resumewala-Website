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
    // ✅ OPTIONAL USER
    let userId = null;

    if (req.user && req.user._id) {
      userId = req.user._id;
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resume file required" });
    }

    // ✅ Extract text
    const text = await extractResumeText(req.file);

    // ✅ AI parsing
    const aiParsed = await parseResumeWithAI(text);

    const parsedSkills = aiParsed.skills || [];
    const parsedExperience = aiParsed.experience || [];
    const parsedEducation = aiParsed.education || [];
    const parsedPersonal = aiParsed.personal || {};

    // ✅ Upload to Cloudinary (use temp id if guest)
    const uploadId = userId || `guest_${Date.now()}`;

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

    /* ================= CASE 1: LOGGED IN USER ================= */
    if (userId) {
      const existingProfile = await Profile.findOne({ userId });

      const profile = await Profile.findOneAndUpdate(
        { userId },
        {
          $set: {
            personal: {
              fullName: parsedPersonal.fullName || "",
              email: parsedPersonal.email || "",
              city: parsedPersonal.city || "",
              currentJobTitle: parsedPersonal.currentJobTitle || "",
              totalExperience: parsedPersonal.totalExperience || "",
              highestQualification: parsedPersonal.highestQualification || "",
              college: parsedPersonal.college || "",
              yearOfPassing: parsedPersonal.yearOfPassing || "",
              currentCTC: parsedPersonal.currentCTC || "",
              dob: parsedPersonal.dob || "",
              gender: parsedPersonal.gender || "",
            },
            resume: resumeData,
            skills: parsedSkills,
            experience: parsedExperience,
            education: parsedEducation,
          },
        },
        { upsert: true, new: true }
      );

      // delete old resume
      if (existingProfile?.resume?.publicId) {
        await cloudinary.uploader.destroy(
          existingProfile.resume.publicId,
          { resource_type: "raw" }
        );
      }

      return res.status(200).json({
        success: true,
        profile,
        resumeUrl: result.secure_url,
        guest: false,
      });
    }

    /* ================= CASE 2: GUEST USER ================= */

    return res.status(200).json({
      success: true,
      guest: true,
      message: "Resume parsed successfully (guest)",
      profile: {
        personal: parsedPersonal,
        skills: parsedSkills,
        experience: parsedExperience,
        education: parsedEducation,
        resume: resumeData,
      },
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

    /* ---------- VALIDATION ---------- */
    if (req.body.personal) {
      const {
        fullName,
        email,
        city,
        currentStatus,
        highestQualification
      } = req.body.personal;

      if (!fullName || !email || !city || !currentStatus || !highestQualification) {
        return res.status(400).json({
          success: false,
          message: "Please fill all required fields (Full Name, Email, City, Current Status, Highest Qualification)"
        });
      }
    }

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

export {
  uploadResume,
  getProfile,
  EditProfile,
  downloadResume,
  saveGuestProfile
};



