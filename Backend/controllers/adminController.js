import Profile from "../models/Profile.js";
import mongoose from "mongoose";
import axios from "axios";

const getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.status(200).json({ success: true, profiles });
    } catch (error) {
        console.error("Get all profiles error:", error);
        res.status(500).json({ message: "Failed to retrieve profiles" });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
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

const EditProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const existingProfile = await Profile.findOne({ userId });
        if (!existingProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }
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

const deleteProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const existingProfile = await Profile.findOne({ userId });
        if (!existingProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        const profile = await Profile.findOneAndDelete({ userId });
        res.status(200).json({ success: true, profile });
    } catch (error) {
        console.error("Delete profile error:", error);
        res.status(500).json({ message: "Failed to delete profile" });
    }
};

const downloadResume = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const profile = await Profile.findOne({ userId });

    if (!profile?.resume?.url) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const fileUrl = profile.resume.url;
    const fileName = profile.resume.fileName || "resume";
    const mimeType =
      profile.resume.mimeType || "application/octet-stream";

    const response = await axios.get(fileUrl, {
      responseType: "stream",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    res.setHeader("Content-Type", mimeType);

    response.data.pipe(res);
  } catch (error) {
    console.error("Resume download error:", error);
    res.status(500).json({ message: "Failed to download resume" });
  }
};

export { getAllProfiles, getProfile, EditProfile, deleteProfile, downloadResume };
