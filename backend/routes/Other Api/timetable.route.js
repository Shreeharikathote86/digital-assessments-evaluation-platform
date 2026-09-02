require("dotenv").config();
const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/multer.middleware.js");
const { getTimetable, addTimetable, deleteTimetable } = require("../../controllers/Other/timetable.controller.js");

// Support both GET and POST for getTimetable
router.get("/getTimetable", getTimetable);
router.post("/getTimetable", getTimetable);

// Routes for adding and deleting timetables
router.post("/addTimetable", upload.single("timetable"), addTimetable);
router.delete("/deleteTimetable/:id", deleteTimetable);

module.exports = router;
