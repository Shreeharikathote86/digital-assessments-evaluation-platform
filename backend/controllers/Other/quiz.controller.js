const Quiz = require("../../models/Other/quiz.model.js");
const QuizSubmission = require("../../models/Other/quizSubmission.model.js");
const Marks = require("../../models/Other/marks.model.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
let genAI;
try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini AI initialized with API key');
} catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
}

// Get all quizzes
const getQuizzes = async (req, res) => {
    try {
        const { branch, semester, subject, createdBy, status } = req.body;
        const query = {};
        
        if (branch) query.branch = branch;
        if (semester) query.semester = semester;
        if (subject) query.subject = subject;
        if (createdBy) query.createdBy = createdBy;
        if (status) query.status = status;

        const quizzes = await Quiz.find(query).sort({ createdAt: -1 });
        
        if (!quizzes || quizzes.length === 0) {
            return res
                .status(200)
                .json({ success: true, message: "No quizzes found", quizzes: [] });
        }

        const data = {
            success: true,
            message: "Quizzes loaded successfully!",
            quizzes,
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get a specific quiz
const getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        const data = {
            success: true,
            message: "Quiz retrieved successfully!",
            quiz,
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Create a new quiz
const createQuiz = async (req, res) => {
    try {
        console.log('Quiz creation request body:', req.body);
        const { title, description, subject, branch, semester, totalMarks, duration, dueDate, createdBy, assessmentType } = req.body;
        
        // Validate required fields
        if (!title || !description || !subject || !branch || !semester || !totalMarks || !duration || !dueDate || !createdBy || !assessmentType) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Ensure numeric fields are numbers and date is properly formatted
        const quizData = {
            ...req.body,
            semester: Number(semester),
            totalMarks: Number(totalMarks),
            duration: Number(duration),
            dueDate: new Date(dueDate),
            questions: req.body.questions || [],
            status: 'Draft'
        };
        
        console.log('Processed quiz data:', quizData);
        const newQuiz = await Quiz.create(quizData);
        
        const data = {
            success: true,
            message: "Quiz created successfully!",
            quiz: newQuiz,
        };
        res.status(201).json(data);
    } catch (error) {
        console.error('Quiz creation error:', error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// Generate quiz questions using Gemini AI
const generateQuizQuestions = async (req, res) => {
    try {
        console.log('Generating quiz questions with Gemini AI');
        const { quizId } = req.params;
        const { topic, numQuestions, difficulty } = req.body;
        
        console.log('Request parameters:', { quizId, topic, numQuestions, difficulty });
        
        if (!topic || !numQuestions) {
            return res.status(400).json({ success: false, message: "Topic and number of questions are required" });
        }
        
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Check if Gemini API is initialized
        if (!genAI) {
            console.error('Gemini AI not initialized properly');
            return res.status(500).json({ 
                success: false, 
                message: "Gemini AI not initialized. Please check your API key configuration." 
            });
        }
        
        // Initialize the generative model
        try {
            console.log('Creating generative model instance');
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
            
            if (!model) {
                throw new Error('Failed to create Gemini model instance');
            }
            
            // Construct the prompt for generating quiz questions
            const difficultyLevel = difficulty || "Medium";
            const prompt = `Generate ${numQuestions} multiple-choice questions on the topic "${topic}" with ${difficultyLevel} difficulty level. 
            For each question, provide 4 options with exactly one correct answer. 
            Format the response as a JSON array with the following structure for each question:
            {
              "questionText": "The question text",
              "options": [
                {"text": "Option A", "isCorrect": false},
                {"text": "Option B", "isCorrect": true},
                {"text": "Option C", "isCorrect": false},
                {"text": "Option D", "isCorrect": false}
              ],
              "correctAnswer": "Option B",
              "marks": 1,
              "difficulty": "${difficultyLevel}"
            }
            Ensure the questions are educational, factually accurate, and appropriate for college-level students.`;
            
            console.log('Sending prompt to Gemini AI');
            
            // Generate content
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            console.log('Received response from Gemini AI');
            
            // Parse the JSON response
            let questions;
            try {
                console.log('Trying to parse AI response...');
                // Log a sample of the response for debugging
                console.log('Response sample:', text.substring(0, 200) + '...');
                
                // Try different parsing approaches
                try {
                    // First attempt: direct JSON parse if the whole response is JSON
                    questions = JSON.parse(text);
                    console.log('Successfully parsed JSON directly');
                } catch (directParseError) {
                    console.log('Direct JSON parse failed, trying regex extraction...');
                    
                    // Second attempt: Extract JSON array using regex
                    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
                    if (jsonMatch) {
                        questions = JSON.parse(jsonMatch[0]);
                        console.log('Successfully extracted JSON array with regex');
                    } else {
                        // Third attempt: Look for individual JSON objects and construct an array
                        console.log('JSON array regex failed, looking for individual objects...');
                        const objectMatches = text.match(/\{[\s\S]*?\}/g);
                        
                        if (objectMatches && objectMatches.length > 0) {
                            questions = [];
                            for (const match of objectMatches) {
                                try {
                                    const obj = JSON.parse(match);
                                    if (obj.questionText && obj.options) {
                                        questions.push(obj);
                                    }
                                } catch (e) {
                                    // Skip invalid JSON objects
                                }
                            }
                            console.log('Constructed array from individual JSON objects');
                        } else {
                            throw new Error("Could not extract JSON from response");
                        }
                    }
                }
                
                console.log(`Successfully parsed ${questions.length} questions`);
                
                // If we couldn't parse any questions, fall back to generating sample questions
                if (!questions || questions.length === 0) {
                    throw new Error("No valid questions parsed from AI response");
                }
            } catch (error) {
                console.error("Error parsing AI response:", error);
                console.log("Falling back to sample questions");
                
                // Fallback to sample questions
                questions = generateSampleQuestions(topic, parseInt(numQuestions) || 5, difficulty || "Medium");
                console.log(`Generated ${questions.length} sample questions as fallback`);
            }
            
            // Update the quiz with the generated questions
            quiz.questions = [...quiz.questions, ...questions];
            await quiz.save();
            
            const data = {
                success: true,
                message: "Quiz questions generated successfully!",
                quiz,
            };
            res.json(data);
        } catch (modelError) {
            console.error('Error with Gemini model:', modelError);
            return res.status(500).json({ 
                success: false, 
                message: "Error with Gemini AI model: " + modelError.message 
            });
        }
    } catch (error) {
        console.error('Quiz question generation error:', error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// Helper function to generate sample questions based on topic
const generateSampleQuestions = (topic, count, difficulty) => {
    const questions = [];
    
    // Sample question templates for different topics
    const questionTemplates = {
        "DBMS": [
            {
                questionText: "What does ACID stand for in database transactions?",
                options: [
                    { text: "Atomicity, Consistency, Isolation, Durability", isCorrect: true },
                    { text: "Aggregation, Concurrency, Isolation, Durability", isCorrect: false },
                    { text: "Atomicity, Concurrency, Integrity, Durability", isCorrect: false },
                    { text: "Aggregation, Consistency, Integrity, Dependency", isCorrect: false }
                ],
                correctAnswer: "Atomicity, Consistency, Isolation, Durability",
                marks: 1,
                difficulty: difficulty
            },
            {
                questionText: "Which normal form deals with removing transitive dependencies?",
                options: [
                    { text: "First Normal Form (1NF)", isCorrect: false },
                    { text: "Second Normal Form (2NF)", isCorrect: false },
                    { text: "Third Normal Form (3NF)", isCorrect: true },
                    { text: "Boyce-Codd Normal Form (BCNF)", isCorrect: false }
                ],
                correctAnswer: "Third Normal Form (3NF)",
                marks: 1,
                difficulty: difficulty
            },
            {
                questionText: "Which of the following is not a type of database key?",
                options: [
                    { text: "Primary Key", isCorrect: false },
                    { text: "Foreign Key", isCorrect: false },
                    { text: "Unique Key", isCorrect: false },
                    { text: "Reference Key", isCorrect: true }
                ],
                correctAnswer: "Reference Key",
                marks: 1,
                difficulty: difficulty
            },
            {
                questionText: "What is a deadlock in DBMS?",
                options: [
                    { text: "When a transaction is waiting for a resource that will never be available", isCorrect: false },
                    { text: "When two or more transactions are waiting for each other to release resources", isCorrect: true },
                    { text: "When a database crashes during a transaction", isCorrect: false },
                    { text: "When a query takes too long to execute", isCorrect: false }
                ],
                correctAnswer: "When two or more transactions are waiting for each other to release resources",
                marks: 1,
                difficulty: difficulty
            },
            {
                questionText: "Which SQL command is used to create a new table?",
                options: [
                    { text: "ALTER TABLE", isCorrect: false },
                    { text: "CREATE TABLE", isCorrect: true },
                    { text: "MAKE TABLE", isCorrect: false },
                    { text: "INSERT TABLE", isCorrect: false }
                ],
                correctAnswer: "CREATE TABLE",
                marks: 1,
                difficulty: difficulty
            }
        ],
        "Programming": [
            {
                questionText: "What is the time complexity of binary search?",
                options: [
                    { text: "O(1)", isCorrect: false },
                    { text: "O(n)", isCorrect: false },
                    { text: "O(log n)", isCorrect: true },
                    { text: "O(n log n)", isCorrect: false }
                ],
                correctAnswer: "O(log n)",
                marks: 1,
                difficulty: difficulty
            },
            {
                questionText: "Which of the following is not an object-oriented programming language?",
                options: [
                    { text: "Java", isCorrect: false },
                    { text: "C++", isCorrect: false },
                    { text: "C", isCorrect: true },
                    { text: "Python", isCorrect: false }
                ],
                correctAnswer: "C",
                marks: 1,
                difficulty: difficulty
            }
        ],
        "default": [
            {
                questionText: `What is the main concept of ${topic}?`,
                options: [
                    { text: `${topic} is primarily about system design`, isCorrect: false },
                    { text: `${topic} focuses on fundamental principles and theories`, isCorrect: true },
                    { text: `${topic} is mainly concerned with practical applications`, isCorrect: false },
                    { text: `${topic} deals with mathematical models only`, isCorrect: false }
                ],
                correctAnswer: `${topic} focuses on fundamental principles and theories`,
                marks: 1,
                difficulty: difficulty
            },
            {
                questionText: `Which of the following is NOT a key component of ${topic}?`,
                options: [
                    { text: "Theoretical frameworks", isCorrect: false },
                    { text: "Practical applications", isCorrect: false },
                    { text: "Historical development", isCorrect: false },
                    { text: "Unrelated disciplines", isCorrect: true }
                ],
                correctAnswer: "Unrelated disciplines",
                marks: 1,
                difficulty: difficulty
            }
        ]
    };
    
    // Select appropriate question templates based on topic
    let selectedTemplates = questionTemplates[topic] || questionTemplates["default"];
    
    // If we don't have enough templates, use default ones to fill the gap
    if (selectedTemplates.length < count) {
        const defaultTemplates = questionTemplates["default"];
        const additionalNeeded = count - selectedTemplates.length;
        
        for (let i = 0; i < additionalNeeded; i++) {
            const defaultTemplate = { ...defaultTemplates[i % defaultTemplates.length] };
            defaultTemplate.questionText = defaultTemplate.questionText.replace(/\$\{topic\}/g, topic);
            selectedTemplates.push(defaultTemplate);
        }
    }
    
    // Take the required number of questions
    for (let i = 0; i < count && i < selectedTemplates.length; i++) {
        questions.push(selectedTemplates[i]);
    }
    
    return questions;
};

// Update a quiz
const updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const updates = req.body;
        
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // If status is being changed to Published, ensure there are questions
        if (updates.status === 'Published' && (!quiz.questions || quiz.questions.length === 0)) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot publish quiz without questions" 
            });
        }
        
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            quizId,
            { $set: updates },
            { new: true }
        );
        
        const data = {
            success: true,
            message: "Quiz updated successfully!",
            quiz: updatedQuiz,
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete a quiz
const deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Delete all submissions related to this quiz
        await QuizSubmission.deleteMany({ quizId });
        
        // Delete the quiz
        await Quiz.findByIdAndDelete(quizId);
        
        const data = {
            success: true,
            message: "Quiz and related submissions deleted successfully!",
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get quiz statistics
const getQuizStats = async (req, res) => {
    try {
        const { quizId } = req.params;
        
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }
        
        // Get all submissions for this quiz
        const submissions = await QuizSubmission.find({ quizId });
        
        // Get unique student IDs who have submitted
        const submittedStudents = [...new Set(submissions.map(sub => sub.studentId))];
        
        // Calculate average score
        let averageScore = 0;
        if (submissions.length > 0) {
            const totalScore = submissions.reduce((sum, sub) => sum + sub.totalMarksObtained, 0);
            averageScore = totalScore / submissions.length;
        }
        
        const data = {
            success: true,
            message: "Quiz statistics retrieved successfully!",
            stats: {
                totalSubmissions: submissions.length,
                submittedStudents,
                averageScore,
                completedCount: submissions.filter(sub => sub.status === 'Completed' || sub.status === 'Evaluated').length,
                inProgressCount: submissions.filter(sub => sub.status === 'In Progress').length,
            },
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getQuizzes,
    getQuizById,
    createQuiz,
    generateQuizQuestions,
    updateQuiz,
    deleteQuiz,
    getQuizStats
};
