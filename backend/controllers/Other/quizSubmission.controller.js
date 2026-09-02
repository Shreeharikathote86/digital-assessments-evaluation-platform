const QuizSubmission = require("../../models/Other/quizSubmission.model.js");
const Quiz = require("../../models/Other/quiz.model.js");
const Marks = require("../../models/Other/marks.model.js");

// Get submissions for a specific quiz
const getSubmissionsByQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        const submissions = await QuizSubmission.find({ quizId }).sort({ createdAt: -1 });
        
        const data = {
            success: true,
            message: "Quiz submissions retrieved successfully!",
            submissions,
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get submissions for a specific student
const getSubmissionsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        console.log('Fetching quiz submissions for student:', studentId);
        
        // Create a more flexible query to handle different student ID formats
        // This will match both string IDs and ObjectIds
        const submissions = await QuizSubmission.find({ 
            $or: [
                { studentId: studentId },
                { studentId: studentId.toString() }
            ]
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${submissions.length} quiz submissions for student ${studentId}`);
        
        // Populate quiz details for each submission
        const submissionsWithDetails = await Promise.all(
            submissions.map(async (submission) => {
                try {
                    const quiz = await Quiz.findById(submission.quizId);
                    return {
                        ...submission._doc,
                        quizDetails: quiz
                    };
                } catch (err) {
                    console.error(`Error fetching quiz details for submission ${submission._id}:`, err);
                    return submission._doc; // Return submission without quiz details if there's an error
                }
            })
        );
        
        // Filter out submissions with null quiz details (in case quiz was deleted)
        const validSubmissions = submissionsWithDetails.filter(sub => sub.quizDetails);
        
        console.log(`Returning ${validSubmissions.length} valid quiz submissions with quiz details`);
        
        const data = {
            success: true,
            message: "Student quiz submissions retrieved successfully!",
            submissions: validSubmissions,
        };
        res.json(data);
    } catch (error) {
        console.error('Error in getSubmissionsByStudent:', error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Start a quiz attempt
const startQuizAttempt = async (req, res) => {
    try {
        const { quizId, studentId } = req.body;
        
        console.log('Starting quiz attempt:', { quizId, studentId });
        
        if (!quizId || !studentId) {
            return res.status(400).json({ success: false, message: "Quiz ID and Student ID are required" });
        }
        
        // Check if quiz exists
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        console.log('Found quiz:', quiz.title);
        
        // Check if quiz is published
        if (quiz.status !== 'Published') {
            return res.status(400).json({ success: false, message: "This quiz is not available for attempt" });
        }
        
        // Check if due date has passed
        if (new Date() > new Date(quiz.dueDate)) {
            return res.status(400).json({ success: false, message: "Quiz submission deadline has passed" });
        }
        
        // Check if student has already attempted this quiz
        const existingSubmission = await QuizSubmission.findOne({ quizId, studentId });
        
        if (existingSubmission) {
            console.log('Found existing submission with status:', existingSubmission.status);
        }
        
        if (existingSubmission && (existingSubmission.status === 'Completed' || existingSubmission.status === 'Evaluated')) {
            return res.status(400).json({ success: false, message: "You have already completed this quiz" });
        }
        
        // If there's an in-progress submission, return it
        if (existingSubmission && existingSubmission.status === 'In Progress') {
            // Prepare quiz questions safely
            const safeQuestions = [];
            if (quiz.questions && Array.isArray(quiz.questions)) {
                for (const q of quiz.questions) {
                    // Create a safe copy of the question without the correct answer
                    const safeQuestion = {
                        questionText: q.questionText,
                        options: q.options ? q.options.map(opt => ({
                            text: opt.text,
                            isCorrect: undefined // Hide correct status
                        })) : [],
                        marks: q.marks,
                        difficulty: q.difficulty,
                        _id: q._id
                    };
                    safeQuestions.push(safeQuestion);
                }
            }
            
            return res.json({
                success: true,
                message: "Continuing previous quiz attempt",
                submission: existingSubmission,
                quiz: {
                    _id: quiz._id,
                    title: quiz.title,
                    description: quiz.description,
                    subject: quiz.subject,
                    branch: quiz.branch,
                    semester: quiz.semester,
                    totalMarks: quiz.totalMarks,
                    duration: quiz.duration,
                    dueDate: quiz.dueDate,
                    status: quiz.status,
                    assessmentType: quiz.assessmentType,
                    questions: safeQuestions
                }
            });
        }
        
        // Create a new quiz submission
        const newSubmission = await QuizSubmission.create({
            quizId,
            studentId,
            startTime: new Date(),
            answers: [],
            status: 'In Progress'
        });
        
        console.log('Created new submission:', newSubmission._id);
        
        // Prepare quiz questions safely
        const safeQuestions = [];
        if (quiz.questions && Array.isArray(quiz.questions)) {
            for (const q of quiz.questions) {
                // Create a safe copy of the question without the correct answer
                const safeQuestion = {
                    questionText: q.questionText,
                    options: q.options ? q.options.map(opt => ({
                        text: opt.text,
                        isCorrect: undefined // Hide correct status
                    })) : [],
                    marks: q.marks,
                    difficulty: q.difficulty,
                    _id: q._id
                };
                safeQuestions.push(safeQuestion);
            }
        }
        
        const data = {
            success: true,
            message: "Quiz attempt started successfully!",
            submission: newSubmission,
            quiz: {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                subject: quiz.subject,
                branch: quiz.branch,
                semester: quiz.semester,
                totalMarks: quiz.totalMarks,
                duration: quiz.duration,
                dueDate: quiz.dueDate,
                status: quiz.status,
                assessmentType: quiz.assessmentType,
                questions: safeQuestions
            }
        };
        
        res.status(201).json(data);
    } catch (error) {
        console.error('Error starting quiz attempt:', error);
        res.status(500).json({ success: false, message: "Internal Server Error: " + error.message });
    }
};

// Submit a quiz answer
const submitQuizAnswer = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { questionId, selectedAnswer } = req.body;
        
        if (!questionId || !selectedAnswer) {
            return res.status(400).json({ success: false, message: "Question ID and selected answer are required" });
        }
        
        const submission = await QuizSubmission.findById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }
        
        if (submission.status !== 'In Progress') {
            return res.status(400).json({ success: false, message: "This quiz submission is already completed" });
        }
        
        // Get the quiz to check the correct answer
        const quiz = await Quiz.findById(submission.quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Find the question
        const question = quiz.questions.find(q => q._id.toString() === questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found in this quiz" });
        }
        
        // Check if the answer is correct
        const isCorrect = question.correctAnswer === selectedAnswer;
        const marksObtained = isCorrect ? question.marks : 0;
        
        // Check if this question has already been answered
        const existingAnswerIndex = submission.answers.findIndex(a => a.questionId.toString() === questionId);
        
        if (existingAnswerIndex !== -1) {
            // Update the existing answer
            submission.answers[existingAnswerIndex] = {
                questionId,
                selectedAnswer,
                isCorrect,
                marksObtained
            };
        } else {
            // Add a new answer
            submission.answers.push({
                questionId,
                selectedAnswer,
                isCorrect,
                marksObtained
            });
        }
        
        await submission.save();
        
        const data = {
            success: true,
            message: "Answer submitted successfully!",
            answer: {
                questionId,
                selectedAnswer,
                isCorrect,
                marksObtained
            }
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Complete a quiz attempt
const completeQuizAttempt = async (req, res) => {
    try {
        const { submissionId } = req.params;
        
        const submission = await QuizSubmission.findById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }
        
        if (submission.status !== 'In Progress') {
            return res.status(400).json({ success: false, message: "This quiz submission is already completed" });
        }
        
        // Get the quiz
        const quiz = await Quiz.findById(submission.quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Calculate total marks obtained
        const totalMarksObtained = submission.answers.reduce((sum, answer) => sum + answer.marksObtained, 0);
        
        // Update the submission
        submission.endTime = new Date();
        submission.totalMarksObtained = totalMarksObtained;
        submission.status = 'Completed';
        
        await submission.save();
        
        // Update student marks in the marks collection
        console.log(`Updating marks for student ${submission.studentId} for quiz ${quiz.title}`);
        
        // Find or create student marks record
        let studentMarks = await Marks.findOne({ enrollmentNo: submission.studentId });
        
        if (!studentMarks) {
            // Create a new marks record if it doesn't exist
            studentMarks = await Marks.create({
                enrollmentNo: submission.studentId,
                isa1: {},
                isa2: {},
                esa: {},
                assignments: [],
                quizzes: []
            });
            console.log(`Created new marks record for student ${submission.studentId}`);
        }
        
        // Check if this quiz is already in the quizzes array
        const existingQuizIndex = studentMarks.quizzes.findIndex(
            q => q.quizId.toString() === submission.quizId.toString()
        );
        
        if (existingQuizIndex !== -1) {
            // Update existing quiz
            studentMarks.quizzes[existingQuizIndex].marks = totalMarksObtained;
            studentMarks.quizzes[existingQuizIndex].submittedAt = new Date();
            console.log(`Updated existing quiz marks for ${quiz.title}`);
        } else {
            // Add new quiz to the array
            studentMarks.quizzes.push({
                quizId: submission.quizId,
                title: quiz.title,
                subject: quiz.subject,
                marks: totalMarksObtained,
                totalMarks: quiz.totalMarks,
                submittedAt: new Date()
            });
            console.log(`Added new quiz marks for ${quiz.title}`);
        }
        
        // If the quiz is tied to a specific assessment type (ISA1, ISA2, ESA),
        // also update the corresponding field
        if (quiz.assessmentType === 'ISA1' || quiz.assessmentType === 'ISA2' || quiz.assessmentType === 'ESA') {
            const subjectKey = quiz.subject;
            
            if (quiz.assessmentType === 'ISA1') {
                if (!studentMarks.isa1) studentMarks.isa1 = {};
                studentMarks.isa1[subjectKey] = totalMarksObtained.toString();
            } else if (quiz.assessmentType === 'ISA2') {
                if (!studentMarks.isa2) studentMarks.isa2 = {};
                studentMarks.isa2[subjectKey] = totalMarksObtained.toString();
            } else if (quiz.assessmentType === 'ESA') {
                if (!studentMarks.esa) studentMarks.esa = {};
                studentMarks.esa[subjectKey] = totalMarksObtained.toString();
            }
            
            console.log(`Updated ${quiz.assessmentType} marks for subject ${subjectKey}`);
        }
        
        // Save the updated marks
        await studentMarks.save();
        console.log(`Saved marks for student ${submission.studentId}`);
        
        
        const data = {
            success: true,
            message: "Quiz completed successfully!",
            submission: {
                ...submission._doc,
                quiz: {
                    title: quiz.title,
                    totalMarks: quiz.totalMarks
                }
            },
            result: {
                totalQuestions: quiz.questions.length,
                answeredQuestions: submission.answers.length,
                correctAnswers: submission.answers.filter(a => a.isCorrect).length,
                totalMarksObtained,
                percentage: (totalMarksObtained / quiz.totalMarks) * 100
            }
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get a specific quiz submission with detailed results
const getQuizSubmissionResult = async (req, res) => {
    try {
        const { submissionId } = req.params;
        
        const submission = await QuizSubmission.findById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }
        
        // Get the quiz
        const quiz = await Quiz.findById(submission.quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Prepare detailed results with questions and answers
        const detailedResults = quiz.questions.map(question => {
            const answer = submission.answers.find(a => a.questionId.toString() === question._id.toString());
            
            return {
                question: question.questionText,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: answer ? answer.selectedAnswer : null,
                isCorrect: answer ? answer.isCorrect : false,
                marksObtained: answer ? answer.marksObtained : 0,
                possibleMarks: question.marks
            };
        });
        
        const data = {
            success: true,
            message: "Quiz submission results retrieved successfully!",
            submission: {
                ...submission._doc,
                quiz: {
                    title: quiz.title,
                    description: quiz.description,
                    subject: quiz.subject,
                    totalMarks: quiz.totalMarks,
                    duration: quiz.duration
                }
            },
            result: {
                totalQuestions: quiz.questions.length,
                answeredQuestions: submission.answers.length,
                correctAnswers: submission.answers.filter(a => a.isCorrect).length,
                totalMarksObtained: submission.totalMarksObtained,
                percentage: (submission.totalMarksObtained / quiz.totalMarks) * 100
            },
            detailedResults
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getSubmissionsByQuiz,
    getSubmissionsByStudent,
    startQuizAttempt,
    submitQuizAnswer,
    completeQuizAttempt,
    getQuizSubmissionResult
};
