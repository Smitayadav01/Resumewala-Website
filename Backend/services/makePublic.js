import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import Profile from "../models/Profile.js";

dotenv.config();




const makePublic = async () => {
  try {
    const profiles = await Profile.find({
      "resume.publicId": { $exists: true, $ne: "" },
    });

    console.log(`🔍 Found ${profiles.length} files\n`);

    for (const profile of profiles) {
      try {
        const publicId = profile.resume.publicId;

        if (!publicId) continue;

        console.log(`🔄 Making public: ${publicId}`);

        await cloudinary.uploader.explicit(publicId, {
          type: "upload",
          resource_type: "raw",
          access_mode: "public",
        });

        console.log("✅ Done");

      } catch (err) {
        console.error("❌ Error:", err.message);
      }
    }

    console.log("\n🎉 All files are now PUBLIC");
    process.exit();

  } catch (error) {
    console.error("❌ Script Error:", error.message);
    process.exit(1);
  }
};

makePublic();