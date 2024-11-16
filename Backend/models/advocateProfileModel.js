const mongoose = require("mongoose");

const advocateProfileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    languages: {
      type: [String],
      default: ["English", "Hindi"], // Default languages
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String, // Store the URL of the profile picture
    },
    enrolmentNo: {
      type: String,
    },
    barCouncilRegNo: {
      type: String,
    },
    yearsOfExperience: {
      type: Number,
    },
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        yearOfPassing: { type: Number },
        extraCourses: { type: String },
      },
    ],
    workExperience: [
      {
        firmName: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        briefDescription: { type: String },
      },
    ],
    specialisations: {
      type: [String],
    },
    casesHandled: {
      type: [String],
    },
    description: {
      type: String,
    },
    preferredClientele: {
      type: [String],
    },
    courts: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdvocateProfile", advocateProfileSchema);
