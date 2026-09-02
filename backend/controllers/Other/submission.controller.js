const Submission = require("../../models/Other/submission.model.js");
const Assignment = require("../../models/Other/assignment.model.js");
const Marks = require("../../models/Other/marks.model.js");
const fs = require("fs");
const path = require("path");

// Get submissions for a specific assignment
const getSubmissionsByAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        
        const submissions = await Submission.find({ assignmentId }).sort({ submissionDate: -1 });
        
        const data = {
            success: true,
            message: "Submissions retrieved successfully!",
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
        
        const submissions = await Submission.find({ studentId }).sort({ submissionDate: -1 });
        
        // Populate assignment details for each submission
        const submissionsWithDetails = await Promise.all(
            submissions.map(async (submission) => {
                const assignment = await Assignment.findById(submission.assignmentId);
                return {
                    ...submission._doc,
                    assignmentDetails: assignment
                };
            })
        );
        
        const data = {
            success: true,
            message: "Student submissions retrieved successfully!",
            submissions: submissionsWithDetails,
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Submit an assignment
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, studentId } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        
        // Check if assignment exists
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }
        
        // Check if student has already submitted this assignment
        const existingSubmission = await Submission.findOne({ assignmentId, studentId });
        if (existingSubmission) {
            // Delete the old file if it exists
            if (existingSubmission.fileUrl) {
                const oldFilePath = path.join(__dirname, '../../../uploads', existingSubmission.fileUrl.split('/').pop());
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            
            // Update the existing submission
            existingSubmission.fileUrl = `/uploads/${req.file.filename}`;
            existingSubmission.fileName = req.file.originalname;
            existingSubmission.fileType = req.file.mimetype;
            existingSubmission.submissionDate = new Date();
            existingSubmission.status = new Date() > new Date(assignment.dueDate) ? 'Late' : 'Submitted';
            existingSubmission.marks = null;
            existingSubmission.feedback = "";
            
            await existingSubmission.save();
            
            return res.json({
                success: true,
                message: "Assignment resubmitted successfully!",
                submission: existingSubmission,
            });
        }
        
        // Create a new submission
        const newSubmission = await Submission.create({
            assignmentId,
            studentId,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            submissionDate: new Date(),
            status: new Date() > new Date(assignment.dueDate) ? 'Late' : 'Submitted',
        });
        
        const data = {
            success: true,
            message: "Assignment submitted successfully!",
            submission: newSubmission,
        };
        res.status(201).json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Evaluate a submission
const evaluateSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { marks, feedback } = req.body;
        
        if (marks === undefined) {
            return res.status(400).json({ success: false, message: "Marks are required" });
        }
        
        const submission = await Submission.findById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }
        
        // Update the submission with evaluation
        submission.marks = marks;
        submission.feedback = feedback || "";
        submission.status = "Evaluated";
        
        await submission.save();
        
        // Get the assignment to determine assessment type
        const assignment = await Assignment.findById(submission.assignmentId);
        
        if (assignment) {
            console.log(`Updating marks for student ${submission.studentId} for assignment ${assignment.title}`);
            
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
            
            // Check if this assignment is already in the assignments array
            const existingAssignmentIndex = studentMarks.assignments.findIndex(
                a => a.assignmentId.toString() === submission.assignmentId.toString()
            );
            
            if (existingAssignmentIndex !== -1) {
                // Update existing assignment
                studentMarks.assignments[existingAssignmentIndex].marks = marks;
                studentMarks.assignments[existingAssignmentIndex].submittedAt = new Date();
                console.log(`Updated existing assignment marks for ${assignment.title}`);
            } else {
                // Add new assignment to the array
                studentMarks.assignments.push({
                    assignmentId: submission.assignmentId,
                    title: assignment.title,
                    subject: assignment.subject,
                    marks: marks,
                    totalMarks: assignment.totalMarks,
                    submittedAt: new Date()
                });
                console.log(`Added new assignment marks for ${assignment.title}`);
            }
            
            // Save the updated marks
            await studentMarks.save();
            console.log(`Saved marks for student ${submission.studentId}`);
            
            // If the assignment is tied to a specific assessment type (ISA1, ISA2, ESA),
            // also update the corresponding field
            if (assignment.assessmentType === 'ISA1' || assignment.assessmentType === 'ISA2' || assignment.assessmentType === 'ESA') {
                const subjectKey = assignment.subject;
                
                if (assignment.assessmentType === 'ISA1') {
                    if (!studentMarks.isa1) studentMarks.isa1 = {};
                    studentMarks.isa1[subjectKey] = marks.toString();
                } else if (assignment.assessmentType === 'ISA2') {
                    if (!studentMarks.isa2) studentMarks.isa2 = {};
                    studentMarks.isa2[subjectKey] = marks.toString();
                } else if (assignment.assessmentType === 'ESA') {
                    if (!studentMarks.esa) studentMarks.esa = {};
                    studentMarks.esa[subjectKey] = marks.toString();
                }
                
                // Save again with the assessment type updates
                await studentMarks.save();
                console.log(`Updated ${assignment.assessmentType} marks for subject ${subjectKey}`);
            }
        }      
        const data = {
            success: true,
            message: "Submission evaluated successfully!",
            submission,
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete a submission
const deleteSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        
        const submission = await Submission.findById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }
        
        // Delete the file if it exists
        if (submission.fileUrl) {
            const filePath = path.join(__dirname, '../../../uploads', submission.fileUrl.split('/').pop());
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        // Delete the submission
        await Submission.findByIdAndDelete(submissionId);
        
        const data = {
            success: true,
            message: "Submission deleted successfully!",
        };
        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getSubmissionsByAssignment,
    getSubmissionsByStudent,
    submitAssignment,
    evaluateSubmission,
    deleteSubmission
};
