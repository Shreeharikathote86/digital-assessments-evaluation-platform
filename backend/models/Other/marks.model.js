const mongoose = require("mongoose");

const Marks = new mongoose.Schema({
  enrollmentNo: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  isa1: {
    type: {},
  },
  isa2: {
    type: {},
  },
  esa: {
    type: {},
  },
  assignments: {
    type: [{
      assignmentId: {
        type: String,
      },
      title: {
        type: String,
      },
      subject: {
        type: String,
      },
      marks: {
        type: Number,
      },
      totalMarks: {
        type: Number,
      },
      submittedAt: {
        type: Date,
      }
    }]
  },
  quizzes: {
    type: [{
      quizId: {
        type: String,
      },
      title: {
        type: String,
      },
      subject: {
        type: String,
      },
      marks: {
        type: Number,
      },
      totalMarks: {
        type: Number,
      },
      submittedAt: {
        type: Date,
      }
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model("Mark", Marks);
