import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 🔥 Ensures ONE resume per user
    },

    personal: {
      fullName: String,
      email: String,
      city: String,
      currentJobTitle: String,
      totalExperience: String,
    },

    skills: [String],

    experience: [
      {
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],

    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: String,
        endDate: String,
      },
    ],

    resumeFile: {
      url: String,
      publicId: String,
      uploadedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);