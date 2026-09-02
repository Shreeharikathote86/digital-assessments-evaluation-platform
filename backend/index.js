// Load environment variables first
require('dotenv').config();

const connectToMongo = require("./database/db");
const express = require("express");
const app = express();
const path = require("path");

// Initialize Cloudinary
require('./config/cloudinary');

connectToMongo();
const port = process.env.PORT || 5000;
var cors = require("cors");

app.use(cors({
  origin: process.env.FRONTEND_API_LINK
}));

app.use(express.json()); //to convert request data to json

app.get("/", (req, res) => {
  res.send("Hello 👋 I am Working Fine 🚀")
})

app.use('/media', express.static(path.join(__dirname, 'media')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Credential Apis
app.use("/api/student/auth", require("./routes/Student Api/credential.route"));
app.use("/api/faculty/auth", require("./routes/Faculty Api/credential.route"));
app.use("/api/admin/auth", require("./routes/Admin Api/credential.route"));
// Details Apis
app.use("/api/student/details", require("./routes/Student Api/details.route"));
app.use("/api/faculty/details", require("./routes/Faculty Api/details.route"));
app.use("/api/admin/details", require("./routes/Admin Api/details.route"));
// Other Apis
app.use("/api/timetable", require("./routes/Other Api/timetable.route"));
app.use("/api/material", require("./routes/Other Api/material.route"));
app.use("/api/notice", require("./routes/Other Api/notice.route"));
app.use("/api/subject", require("./routes/Other Api/subject.route"));
app.use("/api/marks", require("./routes/Other Api/marks.route"));
app.use("/api/branch", require("./routes/Other Api/branch.route"));
// Digital Assessment Platform Apis
app.use("/api/assignment", require("./routes/Other Api/assignment.route"));
app.use("/api/submission", require("./routes/Other Api/submission.route"));
app.use("/api/quiz", require("./routes/Other Api/quiz.route"));
app.use("/api/quizSubmission", require("./routes/Other Api/quizSubmission.route"));
// Enhanced Marks System
app.use("/api/marksEnhanced", require("./routes/Other Api/marksEnhanced.route"));

app.listen(port, () => {
  console.log(`Server Listening On http://localhost:${port}`);
});
