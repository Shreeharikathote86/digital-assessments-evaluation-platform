const Marks = require("../../models/Other/marks.model.js");
const mongoose = require("mongoose");

// Add assignment marks to student record
const addAssignmentMarks = async (req, res) => {
    try {
        const { enrollmentNo, assignmentData } = req.body;
        
        if (!enrollmentNo || !assignmentData) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Find existing marks record or create new one
        let marksRecord = await Marks.findOne({ enrollmentNo });
        
        if (!marksRecord) {
            marksRecord = new Marks({
                enrollmentNo,
                assignments: []
            });
        }

        // Check if this assignment is already in the record
        const existingAssignmentIndex = marksRecord.assignments ? 
            marksRecord.assignments.findIndex(a => 
                a.assignmentId && a.assignmentId.toString() === assignmentData.assignmentId
            ) : -1;

        if (existingAssignmentIndex >= 0) {
            // Update existing assignment
            marksRecord.assignments[existingAssignmentIndex] = assignmentData;
        } else {
            // Add new assignment
            if (!marksRecord.assignments) {
                marksRecord.assignments = [];
            }
            marksRecord.assignments.push(assignmentData);
        }

        await marksRecord.save();

        return res.status(200).json({
            success: true,
            message: "Assignment marks added successfully",
            marks: marksRecord
        });
    } catch (error) {
        console.error("Error adding assignment marks:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Add quiz marks to student record
const addQuizMarks = async (req, res) => {
    try {
        const { enrollmentNo, quizData } = req.body;
        
        if (!enrollmentNo || !quizData) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Find existing marks record or create new one
        let marksRecord = await Marks.findOne({ enrollmentNo });
        
        if (!marksRecord) {
            marksRecord = new Marks({
                enrollmentNo,
                quizzes: []
            });
        }

        // Check if this quiz is already in the record
        const existingQuizIndex = marksRecord.quizzes ? 
            marksRecord.quizzes.findIndex(q => 
                q.quizId && q.quizId.toString() === quizData.quizId
            ) : -1;

        if (existingQuizIndex >= 0) {
            // Update existing quiz
            marksRecord.quizzes[existingQuizIndex] = quizData;
        } else {
            // Add new quiz
            if (!marksRecord.quizzes) {
                marksRecord.quizzes = [];
            }
            marksRecord.quizzes.push(quizData);
        }

        await marksRecord.save();

        return res.status(200).json({
            success: true,
            message: "Quiz marks added successfully",
            marks: marksRecord
        });
    } catch (error) {
        console.error("Error adding quiz marks:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get enhanced marks for a student
const getEnhancedMarks = async (req, res) => {
    try {
        const { enrollmentNo } = req.body;
        
        if (!enrollmentNo) {
            return res.status(400).json({
                success: false,
                message: "Enrollment number is required"
            });
        }

        const marks = await Marks.findOne({ enrollmentNo });
        
        if (!marks) {
            return res.status(404).json({
                success: false,
                message: "No marks found for this student"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Marks retrieved successfully",
            marks
        });
    } catch (error) {
        console.error("Error retrieving marks:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    addAssignmentMarks,
    addQuizMarks,
    getEnhancedMarks
};
