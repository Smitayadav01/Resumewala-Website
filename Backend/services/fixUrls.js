import mongoose from "mongoose";
import dotenv from "dotenv";
import Profile from "../models/Profile.js";

dotenv.config();


console.log("✅ MongoDB Connected");

const fixUrls = async () => {
  try {
    const profiles = await Profile.find({
      "resume.url": { $exists: true, $ne: "" },
    });

    console.log(`🔍 Found ${profiles.length} profiles\n`);

    let count = 0;

    for (const profile of profiles) {
      try {
        if (!profile.resume?.url) continue;

        let oldUrl = profile.resume.url;

        // ❌ skip already correct URLs
        if (oldUrl.includes("/raw/upload/")) {
          console.log("⏭️ Already correct");
          continue;
        }

        // 🔥 FIX: image → raw
        let newUrl = oldUrl.replace("/image/upload/", "/raw/upload/");

        // 🔥 SAVE FIXED URL
        await Profile.updateOne(
          { _id: profile._id },
          {
            $set: {
              "resume.url": newUrl,
            },
          }
        );

        console.log(`✅ Fixed: ${profile._id}`);
        count++;

      } catch (err) {
        console.error(`❌ Error in ${profile._id}:`, err.message);
      }
    }

    console.log(`\n🎉 Done! Fixed ${count} URLs`);
    process.exit();

  } catch (error) {
    console.error("❌ Script Error:", error.message);
    process.exit(1);
  }
};

fixUrls();