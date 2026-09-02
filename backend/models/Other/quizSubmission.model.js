const mongoose = require("mongoose");

const QuizSubmissionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  studentId: {
    type: String, // Enrollment Number
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    selectedAnswer: {
      type: String,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    marksObtained: {
      type: Number,
      default: 0,
    }
  }],
  totalMarksObtained: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Evaluated'],
    default: 'In Progress',
  },
  feedback: {
    type: String,
    default: "",
  }
}, { timestamps: true });

module.exports = mongoose.model("QuizSubmission", QuizSubmissionSchema);
