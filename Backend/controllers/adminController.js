// import Profile from "../models/Profile.js";
// import mongoose from "mongoose";
// import axios from "axios";

// const getAllProfiles = async (req, res) => {
//     try {
//         const profiles = await Profile.find();
//         res.status(200).json({ success: true, profiles });
//     } catch (error) {
//         console.error("Get all profiles error:", error);
//         res.status(500).json({ message: "Failed to retrieve profiles" });
//     }
// };

// const getProfile = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         if (!userId) {
//             return res.status(400).json({ message: "User ID is required" });
//         }
//         const profile = await Profile.findOne({ userId });
//         if (!profile) {
//             return res.status(404).json({ message: "Profile not found" });
//         }
//         res.status(200).json({ success: true, profile });
//     } catch (error) {
//         console.error("Get profile error:", error);
//         res.status(500).json({ message: "Failed to retrieve profile" });
//     }
// };

// const EditProfile = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         if (!userId) {
//             return res.status(400).json({ message: "User ID is required" });
//         }
//         const existingProfile = await Profile.findOne({ userId });
//         if (!existingProfile) {
//             return res.status(404).json({ message: "Profile not found" });
//         }
//         const profile = await Profile.findOneAndUpdate(
//             { userId },
//             { $set: req.body },
//             { new: true }
//         );
//         res.status(200).json({ success: true, profile });
//     } catch (error) {
//         console.error("Edit profile error:", error);
//         res.status(500).json({ message: "Failed to update profile" });
//     }
// };

// const deleteProfile = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         if (!userId) {
//             return res.status(400).json({ message: "User ID is required" });
//         }
//         const existingProfile = await Profile.findOne({ userId });
//         if (!existingProfile) {
//             return res.status(404).json({ message: "Profile not found" });
//         }
//         const profile = await Profile.findOneAndDelete({ userId });
//         res.status(200).json({ success: true, profile });
//     } catch (error) {
//         console.error("Delete profile error:", error);
//         res.status(500).json({ message: "Failed to delete profile" });
//     }
// };

// const downloadResume = async (req, res) => {
//     try {
//         const userId = req.params.id;

//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ message: "Invalid User ID" });
//         }

//         const profile = await Profile.findOne({ userId });

//         if (!profile?.resume?.url) {
//             return res.status(404).json({ message: "Resume not found" });
//         }

//         const { url, fileName } = profile.resume;

//         const response = await axios.get(url, {
//             responseType: "arraybuffer",
//         });

//         const safeFileName = encodeURIComponent(fileName);

//         // 🔥 FIX 1 (VERY IMPORTANT)
//         res.setHeader("Content-Type", "application/octet-stream");

//         // 🔥 FIX 2 (safe filename)
//         res.setHeader(
//             "Content-Disposition",
//             `attachment; filename*=UTF-8''${safeFileName}`
//         );

//         res.send(Buffer.from(response.data));

//     } catch (error) {
//         console.error("Resume download error:", error);
//         res.status(500).json({ message: "Failed to download resume" });
//     }
// };

// export { getAllProfiles, getProfile, EditProfile, deleteProfile, downloadResume };




import Profile from "../models/Profile.js";
import mongoose from "mongoose";
import axios from "axios";

/* =========================
   GET ALL PROFILES
========================= */
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.status(200).json({ success: true, profiles });
  } catch (error) {
    console.error("Get all profiles error:", error);
    res.status(500).json({ message: "Failed to retrieve profiles" });
  }
};

/* =========================
   GET SINGLE PROFILE (by _id)
========================= */
const getProfile = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Profile ID" });
    }

    const profile = await Profile.findById(id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ success: true, profile });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to retrieve profile" });
  }
};

/* =========================
   UPDATE PROFILE (by _id)
========================= */
const EditProfile = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Profile ID" });
    }

    const profile = await Profile.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ success: true, profile });

  } catch (error) {
    console.error("Edit profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/* =========================
   DELETE PROFILE (by _id)
========================= */
const deleteProfile = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Profile ID" });
    }

    const profile = await Profile.findByIdAndDelete(id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({
      success: true,
      message: "Candidate deleted successfully",
    });

  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ message: "Failed to delete profile" });
  }
};

/* =========================
   DOWNLOAD / PREVIEW RESUME
========================= */
const downloadResume = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Profile ID" });
    }

    const profile = await Profile.findById(id);

    if (!profile?.resume?.url) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const { url, fileName } = profile.resume;

    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });

    const safeFileName = encodeURIComponent(fileName || "resume.pdf");

    // ✅ For preview inside browser (iframe)
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename*=UTF-8''${safeFileName}`
    );

    res.send(Buffer.from(response.data));

  } catch (error) {
    console.error("Resume download error:", error);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
};


export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getAllProfiles,
  getProfile,
  EditProfile,
  deleteProfile,
  downloadResume,
};