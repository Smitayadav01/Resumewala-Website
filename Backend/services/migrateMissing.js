import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import Profile from "../models/Profile.js";

dotenv.config();




const migrateMissing = async () => {
  const profiles = await Profile.find({
    "resume.publicId": { $exists: true, $ne: "" },
  });

  console.log(`🔍 Checking ${profiles.length} profiles\n`);

  for (const profile of profiles) {
    try {
      const { publicId, url } = profile.resume;

      if (!publicId) continue;

      // 🔍 Check if exists in NEW cloud
      try {
        await cloudinary.api.resource(publicId, {
          resource_type: "raw",
        });

        console.log("⏭️ Already exists:", publicId);
        continue;

      } catch {
        console.log("❌ Missing → migrating:", publicId);
      }

      // 🔥 Fetch from OLD cloud
      const oldUrl = `https://res.cloudinary.com/${OLD_CLOUD}/raw/upload/${publicId}`;

      const result = await cloudinary.uploader.upload(oldUrl, {
        public_id: publicId,
        resource_type: "raw",
        overwrite: true,
      });

      const fixedUrl = result.secure_url.replace("/image/upload/", "/raw/upload/");

      // 🔥 Update DB
      await Profile.updateOne(
        { _id: profile._id },
        {
          $set: {
            "resume.url": fixedUrl,
          },
        }
      );

      console.log("✅ Migrated:", publicId);

    } catch (err) {
      console.error("❌ Error:", err.message);
    }
  }

  console.log("\n🎉 Missing files migration DONE");
  process.exit();
};

migrateMissing();