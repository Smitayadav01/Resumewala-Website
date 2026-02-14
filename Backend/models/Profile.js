import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ---------------- PERSONAL INFO ---------------- */
    personal: {
      fullName: String,
      gender: String,
      dob: String,
      age: String,
      city: String,
      email: String,

      currentStatus: String,
      totalExperience: String,

      currentJobTitle: String,
      companyName: String,
      industry: String,
      designation: String,

      currentCTC: String,
      location: String,
      preferredLocation: String,

      employmentType: String,
      workMode: String,

      highestQualification: String,
      college: String,
      yearOfPassing: String,
    },

    /* ---------------- RESUME ---------------- */
    resume: {
      url: String,
      publicId: String,
      uploadedAt: Date,
    },

    /* ---------------- EXPERIENCE ---------------- */
    experience: [
      {
        company: String,
        position: String,
        employmentType: String,
        location: String,
        startDate: String,
        endDate: String,
        currentlyWorking: Boolean,
        noticePeriod: String,
        skillsUsed: [String],
        description: String,
      },
    ],

    /* ---------------- EDUCATION ---------------- */
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

    /* ---------------- SKILLS ---------------- */
    skills: [String],

    /* ---------------- SETTINGS ---------------- */
    profileVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ProfileModel = mongoose.model("Profile", ProfileSchema);

export default ProfileModel;
