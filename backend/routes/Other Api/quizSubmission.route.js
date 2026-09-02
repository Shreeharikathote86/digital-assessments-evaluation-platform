const express = require("express");
const { 
    getSubmissionsByQuiz, 
    getSubmissionsByStudent, 
    startQuizAttempt, 
    submitQuizAnswer, 
    completeQuizAttempt, 
    getQuizSubmissionResult 
} = require("../../controllers/Other/quizSubmission.controller");
const router = express.Router();

router.get("/getSubmissionsByQuiz/:quizId", getSubmissionsByQuiz);
router.get("/getSubmissionsByStudent/:studentId", getSubmissionsByStudent);
router.post("/startQuizAttempt", startQuizAttempt);
router.post("/submitQuizAnswer/:submissionId", submitQuizAnswer);
router.post("/completeQuizAttempt/:submissionId", completeQuizAttempt);
router.get("/getQuizSubmissionResult/:submissionId", getQuizSubmissionResult);

module.exports = router;
