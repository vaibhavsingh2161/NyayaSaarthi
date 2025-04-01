// models/AdvocateDetails.js

const mongoose = require('mongoose');

const advocateDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  languages: [String],
  dob: Date,
  location: String,
  profilePicture: String,  // You can store the URL if the image is uploaded to a cloud service
  enrolmentNo: String,
  barCouncilRegNo: String,
  yearsOfExperience: Number,
  education: [
    {
      degree: String,
      university: String,
      yearOfPassing: Number,
      extraCourses: String
    }
  ],
  workExperience: [
    {
      firm: String,
      startDate: Date,
      endDate: Date,
      briefExperience: String
    }
  ],
  specialisation: [String],
  casesHandled: [String],
  description: String,
  clientele: [String],
  courts: [String]
});

const AdvocateDetails = mongoose.model('AdvocateDetails', advocateDetailsSchema);

module.exports = AdvocateDetails;
