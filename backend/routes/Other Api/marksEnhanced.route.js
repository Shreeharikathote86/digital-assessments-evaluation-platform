const express = require("express");
const router = express.Router();
const { addAssignmentMarks, addQuizMarks, getEnhancedMarks } = require("../../controllers/Other/marksEnhanced.controller.js");

// Add assignment marks to student record
router.post("/addAssignmentMarks", addAssignmentMarks);

// Add quiz marks to student record
router.post("/addQuizMarks", addQuizMarks);

// Get enhanced marks for a student
router.post("/getEnhancedMarks", getEnhancedMarks);

module.exports = router;
