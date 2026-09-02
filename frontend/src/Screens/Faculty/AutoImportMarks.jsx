import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Tabs, Tab, ProgressBar } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import { baseApiURL } from "../../baseUrl";
import Heading from "../../components/Heading";
import toast from "react-hot-toast";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AutoImportMarks = () => {
  const { userData, userLoginId } = useSelector((state) => state);
  
  const [branch, setBranch] = useState([]);
  const [subject, setSubject] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [selected, setSelected] = useState({
    branch: "",
    semester: "",
    subject: "",
  });

  useEffect(() => {
    getBranchData();
    getSubjectData();
  }, []);

  useEffect(() => {
    if (selected.branch && selected.semester && selected.subject) {
      fetchStudents();
      fetchAssignments();
      fetchQuizzes();
    }
  }, [selected.branch, selected.semester, selected.subject]);

  const getBranchData = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/branch/getBranch`, { headers })
      .then((response) => {
        if (response.data.success) {
          setBranch(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message);
      });
  };

  const getSubjectData = () => {
    toast.loading("Loading Subjects");
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          setSubject(response.data.subject);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.message);
      });
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${baseApiURL()}/student/details/getDetails`,
        { branch: selected.branch, semester: selected.semester }
      );
      
      if (response.data.success) {
        setStudents(response.data.user);
      } else {
        setError(response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/assignment/getAssignments`, {
        branch: selected.branch,
        semester: selected.semester,
        subject: selected.subject
      });
      
      setAssignments(response.data.assignments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load assignments');
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/quiz/getQuizzes`, {
        branch: selected.branch,
        semester: selected.semester,
        subject: selected.subject
      });
      
      setQuizzes(response.data.quizzes || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
      setLoading(false);
    }
  };

  const fetchAssignmentSubmissions = async (assignmentId) => {
    try {
      const response = await axios.get(`${API_URL}/api/submission/getSubmissionsByAssignment/${assignmentId}`);
      return response.data.submissions || [];
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      return [];
    }
  };

  const fetchQuizSubmissions = async (quizId) => {
    try {
      const response = await axios.get(`${API_URL}/api/quizSubmission/getSubmissionsByQuiz/${quizId}`);
      return response.data.submissions || [];
    } catch (error) {
      console.error('Error fetching quiz submissions:', error);
      return [];
    }
  };

  const importMarks = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Process assignments
      for (const assignment of assignments) {
        const submissions = await fetchAssignmentSubmissions(assignment._id);
        
        for (const submission of submissions) {
          if (submission.status === 'Evaluated') {
            // Add to student's marks
            await addAssignmentMarks(
              submission.studentId,
              {
                assignmentId: assignment._id,
                title: assignment.title,
                subject: assignment.subject,
                marks: submission.marks,
                totalMarks: assignment.totalMarks,
                submittedAt: submission.submittedAt || submission.updatedAt
              }
            );
          }
        }
      }
      
      // Process quizzes
      for (const quiz of quizzes) {
        const submissions = await fetchQuizSubmissions(quiz._id);
        
        for (const submission of submissions) {
          if (submission.status === 'Completed' || submission.status === 'Evaluated') {
            // Add to student's marks
            await addQuizMarks(
              submission.studentId,
              {
                quizId: quiz._id,
                title: quiz.title,
                subject: quiz.subject,
                marks: submission.totalMarksObtained,
                totalMarks: quiz.totalMarks,
                submittedAt: submission.submittedAt || submission.updatedAt
              }
            );
          }
        }
      }
      
      setLoading(false);
      setSuccess('Successfully imported all assignment and quiz marks!');
      toast.success('Marks imported successfully!');
    } catch (error) {
      console.error('Error importing marks:', error);
      setError('Failed to import marks');
      setLoading(false);
      toast.error('Failed to import marks');
    }
  };

  const addAssignmentMarks = async (studentId, assignmentData) => {
    try {
      const response = await axios.post(`${API_URL}/api/marks/addAssignmentMarks`, {
        enrollmentNo: studentId,
        assignmentData
      });
      return response.data;
    } catch (error) {
      console.error('Error adding assignment marks:', error);
      throw error;
    }
  };

  const addQuizMarks = async (studentId, quizData) => {
    try {
      const response = await axios.post(`${API_URL}/api/marks/addQuizMarks`, {
        enrollmentNo: studentId,
        quizData
      });
      return response.data;
    } catch (error) {
      console.error('Error adding quiz marks:', error);
      throw error;
    }
  };

  return (
    <div className="w-full mx-auto flex justify-center items-start flex-col my-10">
      <Heading title="Auto Import Marks" />
      
      <div className="mt-10 w-full flex justify-evenly items-center gap-x-6">
        <div className="w-full">
          <label htmlFor="branch" className="leading-7 text-base">
            Select Branch
          </label>
          <select
            id="branch"
            className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
            value={selected.branch}
            onChange={(e) =>
              setSelected({ ...selected, branch: e.target.value })
            }
          >
            <option defaultValue>-- Select --</option>
            {branch &&
              branch.map((branch) => {
                return (
                  <option value={branch.name} key={branch.name}>
                    {branch.name}
                  </option>
                );
              })}
          </select>
        </div>
        <div className="w-full">
          <label htmlFor="semester" className="leading-7 text-base">
            Select Semester
          </label>
          <select
            id="semester"
            className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
            value={selected.semester}
            onChange={(e) =>
              setSelected({ ...selected, semester: e.target.value })
            }
          >
            <option defaultValue>-- Select --</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">3rd Semester</option>
            <option value="4">4th Semester</option>
            <option value="5">5th Semester</option>
            <option value="6">6th Semester</option>
            <option value="7">7th Semester</option>
            <option value="8">8th Semester</option>
          </select>
        </div>
        <div className="w-full">
          <label htmlFor="subject" className="leading-7 text-base">
            Select Subject
          </label>
          <select
            id="subject"
            className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
            value={selected.subject}
            onChange={(e) =>
              setSelected({ ...selected, subject: e.target.value })
            }
          >
            <option defaultValue>-- Select --</option>
            {subject &&
              subject.map((subject) => {
                return (
                  <option value={subject.name} key={subject.name}>
                    {subject.name}
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mt-4 w-full">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mt-4 w-full">
          {success}
        </Alert>
      )}

      {loading ? (
        <div className="mt-8 w-full text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {selected.branch && selected.semester && selected.subject && (
            <div className="mt-8 w-full">
              <Tabs defaultActiveKey="assignments" className="mb-4">
                <Tab eventKey="assignments" title="Assignments">
                  <Card>
                    <Card.Header>
                      <h5>Assignments for {selected.subject}</h5>
                    </Card.Header>
                    <Card.Body>
                      {assignments.length > 0 ? (
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Title</th>
                              <th>Due Date</th>
                              <th>Total Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignments.map((assignment, index) => (
                              <tr key={assignment._id}>
                                <td>{index + 1}</td>
                                <td>{assignment.title}</td>
                                <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                                <td>{assignment.totalMarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <p>No assignments found for this subject.</p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab>
                <Tab eventKey="quizzes" title="Quizzes">
                  <Card>
                    <Card.Header>
                      <h5>Quizzes for {selected.subject}</h5>
                    </Card.Header>
                    <Card.Body>
                      {quizzes.length > 0 ? (
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Title</th>
                              <th>Due Date</th>
                              <th>Total Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quizzes.map((quiz, index) => (
                              <tr key={quiz._id}>
                                <td>{index + 1}</td>
                                <td>{quiz.title}</td>
                                <td>{new Date(quiz.dueDate).toLocaleDateString()}</td>
                                <td>{quiz.totalMarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <p>No quizzes found for this subject.</p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab>
                <Tab eventKey="students" title="Students">
                  <Card>
                    <Card.Header>
                      <h5>Students in {selected.branch} - Semester {selected.semester}</h5>
                    </Card.Header>
                    <Card.Body>
                      {students.length > 0 ? (
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Enrollment No</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((student, index) => (
                              <tr key={student._id}>
                                <td>{index + 1}</td>
                                <td>{student.firstName} {student.lastName}</td>
                                <td>{student.enrollmentNo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <p>No students found for this branch and semester.</p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab>
              </Tabs>

              <div className="mt-4 d-flex justify-content-center">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={importMarks}
                  disabled={loading || !(assignments.length > 0 || quizzes.length > 0)}
                >
                  Import Assignment & Quiz Marks
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AutoImportMarks;
