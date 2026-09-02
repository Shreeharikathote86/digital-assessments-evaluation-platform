const express = require("express");
const { 
    getAssignments, 
    createAssignment, 
    updateAssignment, 
    deleteAssignment, 
    getAssignmentStats 
} = require("../../controllers/Other/assignment.controller");
const router = express.Router();

router.post("/getAssignments", getAssignments);
router.post("/createAssignment", createAssignment);
router.put("/updateAssignment/:id", updateAssignment);
router.delete("/deleteAssignment/:id", deleteAssignment);
router.get("/getAssignmentStats/:id", getAssignmentStats);

module.exports = router;
