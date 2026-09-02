const Assignment = require("../../models/Other/assignment.model.js");
const Submission = require("../../models/Other/submission.model.js");

// Get all assignments
const getAssignments = async (req, res) => {
    try {
        const { branch, semester, subject, createdBy } = req.body;
        const query = {};
        
        if (branch) query.branch = branch;
        if (semester) query.semester = semester;
        if (subject) query.subject = subject;
        if (createdBy) query.createdBy = createdBy;

        const assignments = await Assignment.find(query).sort({ createdAt: -1 });
        
        if (!assignments || assignments.length === 0) {
            return res
                .status(200)
                .json({ success: true, message: "No assignments found", assignments: [] });
        }

        const data = {
            success: true,
            message: "Assignments loaded successfully!",
            assignments,
        };
        res.json(data);
    } catch (error) {
        console.error('Assignment creation error:', error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// Create a new assignment
const createAssignment = async (req, res) => {
    try {
        console.log('Assignment creation request body:', req.body);
        const { title, description, subject, branch, semester, dueDate, totalMarks, createdBy, assessmentType } = req.body;
        
        // Validate required fields
        if (!title || !description || !subject || !branch || !semester || !dueDate || !totalMarks || !createdBy || !assessmentType) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Ensure numeric fields are numbers
        const assignmentData = {
            ...req.body,
            semester: Number(semester),
            totalMarks: Number(totalMarks),
            dueDate: new Date(dueDate)
        };

        console.log('Processed assignment data:', assignmentData);
        const newAssignment = await Assignment.create(assignmentData);
        
        const data = {
            success: true,
            message: "Assignment created successfully!",
            assignment: newAssignment,
        };
        res.status(201).json(data);
    } catch (error) {
        console.error('Assignment creation error:', error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// Update an assignment
const updateAssignment = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const updates = req.body;
        
        const assignment = await Assignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }
        
        const updatedAssignment = await Assignment.findByIdAndUpdate(
            assignmentId,
            { $set: updates },
            { new: true }
        );
        
        const data = {
            success: true,
            message: "Assignment updated successfully!",
            assignment: updatedAssignment,
        };
        res.json(data);
    } catch (error) {
        console.error('Assignment creation error:', error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// Delete an assignment
const deleteAssignment = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        
        const assignment = await Assignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }
        
        // Delete all submissions related to this assignment
        await Submission.deleteMany({ assignmentId });
        
        // Delete the assignment
        await Assignment.findByIdAndDelete(assignmentId);
        
        const data = {
            success: true,
            message: "Assignment and related submissions deleted successfully!",
        };
        res.json(data);
    } catch (error) {
        console.error('Assignment creation error:', error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

// Get assignment submission statistics
const getAssignmentStats = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        
        const assignment = await Assignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }
        
        // Get all submissions for this assignment
        const submissions = await Submission.find({ assignmentId });
        
        // Get unique student IDs who have submitted
        const submittedStudents = [...new Set(submissions.map(sub => sub.studentId))];
        
        const data = {
            success: true,
            message: "Assignment statistics retrieved successfully!",
            stats: {
                totalSubmissions: submissions.length,
                submittedStudents,
                evaluatedCount: submissions.filter(sub => sub.status === 'Evaluated').length,
                pendingCount: submissions.filter(sub => sub.status === 'Submitted').length,
                lateCount: submissions.filter(sub => sub.status === 'Late').length,
            },
        };
        res.json(data);
    } catch (error) {
        console.error('Assignment creation error:', error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

module.exports = { 
    getAssignments, 
    createAssignment, 
    updateAssignment, 
    deleteAssignment, 
    getAssignmentStats 
};
