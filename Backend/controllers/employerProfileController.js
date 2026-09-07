import Employer from "../models/Employer.js";
import cloudinary from "../config/cloudinary.js";

export const updateProfile = async (req, res) => {
  try {
    const { companyName, recruiterName, mobile, companyLocation, companyWebsite, companyDescription, industryType, companySize } = req.body;
    const employer = await Employer.findByIdAndUpdate(
      req.employer._id,
      { companyName, recruiterName, mobile, companyLocation, companyWebsite, companyDescription, industryType, companySize },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Profile updated.", employer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "resumewala/employer_logos",
      transformation: [{ width: 300, height: 300, crop: "fill" }],
    });

    const employer = await Employer.findByIdAndUpdate(
      req.employer._id,
      { companyLogo: result.secure_url },
      { new: true }
    ).select("-password");

    res.json({ message: "Logo uploaded.", companyLogo: result.secure_url, employer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};