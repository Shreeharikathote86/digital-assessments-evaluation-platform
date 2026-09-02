const express = require("express");
const { 
    getQuizzes, 
    getQuizById, 
    createQuiz, 
    generateQuizQuestions, 
    updateQuiz, 
    deleteQuiz, 
    getQuizStats 
} = require("../../controllers/Other/quiz.controller");
const router = express.Router();

router.post("/getQuizzes", getQuizzes);
router.get("/getQuizById/:quizId", getQuizById);
router.post("/createQuiz", createQuiz);
router.post("/generateQuizQuestions/:quizId", generateQuizQuestions);
router.put("/updateQuiz/:quizId", updateQuiz);
router.delete("/deleteQuiz/:quizId", deleteQuiz);
router.get("/getQuizStats/:quizId", getQuizStats);

module.exports = router;
