import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import Profile from "../models/Profile.js";

dotenv.config();



const migrate = async () => {
  const profiles = await Profile.find({
    "resume.url": { $exists: true, $ne: "" }
  });

  const total = profiles.length;
  let count = 0;

  console.log(`🚀 Starting migration of ${total} profiles\n`);

  for (const profile of profiles) {
    count++;

    try {
      if (!profile.resume || !profile.resume.publicId) {
        console.log(`⏭️ Skipping ${profile._id}`);
        continue;
      }

      // ✅ Skip already migrated (new cloud)
      if (profile.resume.url.includes("dlidgrdia")) {
        console.log(`⏭️ Already migrated`);
        continue;
      }

      const { publicId } = profile.resume;

      // 🔥 fetch from OLD cloud
      const oldUrl = `https://res.cloudinary.com/de3ad7gzi/raw/upload/${publicId}`;

      console.log(`\n[${count}/${total}] Migrating: ${publicId}`);

      const result = await cloudinary.uploader.upload(oldUrl, {
        public_id: publicId,
        resource_type: "raw",
        type: "upload",
        access_mode: "public",
        overwrite: true,
      });

      // ✅ FIX URL
      const fixedUrl = result.secure_url.replace(
        "/image/upload/",
        "/raw/upload/"
      );

      // ✅ update DB
      await Profile.updateOne(
        { _id: profile._id },
        {
          $set: {
            "resume.url": fixedUrl
          }
        }
      );

      console.log(`✅ Done`);

      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
  }

  console.log("\n🎉 Migration Completed");
  process.exit();
};

migrate();









