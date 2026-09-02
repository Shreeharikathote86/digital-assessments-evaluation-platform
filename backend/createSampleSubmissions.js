// Script to create sample assignment and quiz submissions for testing
require('dotenv').config();
const mongoose = require('mongoose');
const Assignment = require('./models/Other/assignment.model.js');
const Submission = require('./models/Other/submission.model.js');
const Quiz = require('./models/Other/quiz.model.js');
const QuizSubmission = require('./models/Other/quizSubmission.model.js');

// Connect to MongoDB
const connectToMongo = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI, { useNewUrlParser: true });
    console.log('Connected to MongoDB Successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
};

// Create sample data
const createSampleData = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectToMongo();
    if (!connected) {
      console.error('Failed to connect to MongoDB. Exiting...');
      return;
    }

    // Student ID to use
    const studentId = '123123';
    
    // Create a sample assignment if none exists
    let assignment = await Assignment.findOne();
    if (!assignment) {
      assignment = await Assignment.create({
        title: 'DBMS Assignment 1',
        description: 'Sample assignment for testing',
        subject: 'DBMS',
        branch: 'CSE',
        semester: 5,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalMarks: 20,
        createdBy: 'faculty123',
        assessmentType: 'ISA1'
      });
      console.log('Created sample assignment:', assignment._id);
    } else {
      console.log('Using existing assignment:', assignment._id);
    }
    
    // Create a sample assignment submission
    let submission = await Submission.findOne({ studentId, assignmentId: assignment._id });
    if (!submission) {
      submission = await Submission.create({
        assignmentId: assignment._id,
        studentId: studentId,
        fileUrl: '/uploads/sample.pdf',
        fileName: 'sample.pdf',
        fileType: 'application/pdf',
        submissionDate: new Date(),
        status: 'Evaluated',
        marks: 18,
        feedback: 'Good work!'
      });
      console.log('Created sample assignment submission');
    } else {
      // Update existing submission to ensure it's evaluated
      submission.status = 'Evaluated';
      submission.marks = 18;
      submission.feedback = 'Good work!';
      await submission.save();
      console.log('Updated existing assignment submission');
    }
    
    // Create a sample quiz if none exists
    let quiz = await Quiz.findOne();
    if (!quiz) {
      quiz = await Quiz.create({
        title: 'DBMS Quiz 1',
        description: 'Sample quiz for testing',
        subject: 'DBMS',
        branch: 'CSE',
        semester: 5,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalMarks: 10,
        duration: 30, // 30 minutes
        createdBy: 'faculty123',
        status: 'Published',
        assessmentType: 'ISA1',
        questions: [
          {
            questionText: 'What is a primary key?',
            options: [
              { text: 'A key that is primary', isCorrect: false },
              { text: 'A unique identifier for a record', isCorrect: true },
              { text: 'A foreign key', isCorrect: false },
              { text: 'None of the above', isCorrect: false }
            ],
            marks: 2,
            difficulty: 'Easy'
          },
          {
            questionText: 'What is normalization?',
            options: [
              { text: 'Converting data to normal form', isCorrect: false },
              { text: 'Organizing data to reduce redundancy', isCorrect: true },
              { text: 'Normalizing database size', isCorrect: false },
              { text: 'None of the above', isCorrect: false }
            ],
            marks: 2,
            difficulty: 'Medium'
          }
        ]
      });
      console.log('Created sample quiz:', quiz._id);
    } else {
      console.log('Using existing quiz:', quiz._id);
    }
    
    // Create a sample quiz submission
    let quizSubmission = await QuizSubmission.findOne({ studentId, quizId: quiz._id });
    if (!quizSubmission) {
      quizSubmission = await QuizSubmission.create({
        quizId: quiz._id,
        studentId: studentId,
        startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        endTime: new Date(),
        status: 'Completed',
        answers: [
          {
            questionId: quiz.questions[0]._id,
            selectedAnswer: 1, // Index of the correct option
            isCorrect: true,
            marksObtained: 2
          },
          {
            questionId: quiz.questions[1]._id,
            selectedAnswer: 1, // Index of the correct option
            isCorrect: true,
            marksObtained: 2
          }
        ],
        totalMarksObtained: 4
      });
      console.log('Created sample quiz submission');
    } else {
      // Update existing submission to ensure it's completed
      quizSubmission.status = 'Completed';
      quizSubmission.totalMarksObtained = 4;
      await quizSubmission.save();
      console.log('Updated existing quiz submission');
    }
    
    console.log('Sample data creation completed successfully');
  } catch (error) {
    console.error('Error during sample data creation:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the sample data creation
createSampleData();
