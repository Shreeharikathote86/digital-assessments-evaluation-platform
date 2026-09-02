const mongoose = require("mongoose");

const Assignment = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  assessmentType: {
    type: String,
    enum: ['ISA1', 'ISA2', 'ESA', 'Other'],
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Assignment", Assignment);
