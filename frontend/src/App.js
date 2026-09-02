import React from "react";
import Login from "./components/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import mystore from "./redux/store";
import StudentHome from "./Screens/Student/Home";
import FacultyHome from "./Screens/Faculty/Home";
import AdminHome from "./Screens/Admin/Home";

// Student Assessment Components
import QuizAttempt from "./Screens/Student/QuizAttempt";
import QuizResult from "./Screens/Student/QuizResult";
import EnhancedMarksView from "./Screens/Student/EnhancedMarksView";

// Faculty Assessment Components
import AssignmentSubmissions from "./Screens/Faculty/AssignmentSubmissions";
import QuizEditor from "./Screens/Faculty/QuizEditor";
import QuizSubmissions from "./Screens/Faculty/QuizSubmissions";
import { default as FacultyQuizResult } from "./Screens/Faculty/QuizResult";

const App = () => {
  return (
    <>
      <Provider store={mystore}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="student" element={<StudentHome />} />
            <Route path="student/quiz-attempt/:quizId" element={<QuizAttempt />} />
            <Route path="student/quiz-result/:submissionId" element={<QuizResult />} />
            <Route path="student/enhanced-marks" element={<EnhancedMarksView />} />
            <Route path="faculty" element={<FacultyHome />} />
            <Route path="faculty/assignment-submissions/:assignmentId" element={<AssignmentSubmissions />} />
            <Route path="faculty/quiz-editor/:quizId" element={<QuizEditor />} />
            <Route path="faculty/quiz-submissions/:quizId" element={<QuizSubmissions />} />
            <Route path="faculty/quiz-result/:submissionId" element={<FacultyQuizResult />} />
            <Route path="admin" element={<AdminHome />} />
          </Routes>
        </Router>
      </Provider>
    </>
  );
};

export default App;
