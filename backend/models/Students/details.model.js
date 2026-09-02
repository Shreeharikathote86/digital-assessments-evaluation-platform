const mongoose = require("mongoose");

const studentDetails = new mongoose.Schema({
  enrollmentNo: {
    type: String, // Changed from Number to String to be more flexible
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    required: false, // Made optional
    default: ""
  },
  lastName: {
    type: String,
    required: false, // Made optional
    default: ""
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String, // Changed from Number to String to be more flexible
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: false, // Made optional
    default: ""
  },
  profile: {
    type: String,
    required: false, // Making profile optional
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Student Detail", studentDetails);
