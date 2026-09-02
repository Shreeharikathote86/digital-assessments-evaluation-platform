const mongoose = require("mongoose");

const Submission = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  studentId: {
    type: String, // Enrollment Number
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  marks: {
    type: Number,
    default: null,
  },
  feedback: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ['Submitted', 'Evaluated', 'Late'],
    default: 'Submitted',
  }
}, { timestamps: true });

module.exports = mongoose.model("Submission", Submission);
