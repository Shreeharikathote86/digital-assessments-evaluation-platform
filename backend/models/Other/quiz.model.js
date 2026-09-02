const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
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
  createdBy: {
    type: String, // Faculty ID
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Closed'],
    default: 'Draft',
  },
  assessmentType: {
    type: String,
    enum: ['ISA1', 'ISA2', 'ESA', 'Other'],
    required: true,
  },
  questions: [{
    questionText: {
      type: String,
      required: true,
    },
    options: [{
      text: String,
      isCorrect: Boolean,
    }],
    correctAnswer: {
      type: String,
      required: true,
    },
    marks: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Quiz", QuizSchema);
