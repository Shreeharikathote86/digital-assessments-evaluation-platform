const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { 
    getSubmissionsByAssignment, 
    getSubmissionsByStudent, 
    submitAssignment, 
    evaluateSubmission, 
    deleteSubmission 
} = require("../../controllers/Other/submission.controller");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only PDF and Word documents
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and Word documents are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

router.get("/getSubmissionsByAssignment/:assignmentId", getSubmissionsByAssignment);
router.get("/getSubmissionsByStudent/:studentId", getSubmissionsByStudent);
router.post("/submitAssignment", upload.single('file'), submitAssignment);
router.put("/evaluateSubmission/:submissionId", evaluateSubmission);
router.delete("/deleteSubmission/:submissionId", deleteSubmission);

module.exports = router;
