import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  personal: {
    fullName: String,
    email: String,
    mobile: String,
    address: String,
  },

  resume: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },

  experience: [
    {
      company: String,
      position: String,
      employmentType: String,
      location: String,
      startDate: String,
      endDate: String,
      noticePeriod: String,
      skillsUsed: [String],
      description: String,
    },
  ],

  education: [
    {
      institution: String,
      university: String,
      degree: String,
      fieldOfStudy: String,
      educationType: String,
      startDate: String,
      endDate: String,
      grade: String,
    },
  ],

  skills: [String],
  profileVisible: { type: Boolean, default: true },
});

const ProfileModel = mongoose.model("Profile",ProfileSchema);

export default ProfileModel;
