const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  personal: {
    fullName: String,
    email: String,
    mobile: String,
    address: String,
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
      skillsUsed: String,
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

module.exports = mongoose.model("Profile", ProfileSchema);
