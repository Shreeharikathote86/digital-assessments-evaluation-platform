import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner, Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { FaArrowLeft, FaDownload, FaEdit, FaCheck, FaClock, FaHourglassHalf } from 'react-icons/fa';

const AssignmentSubmissions = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { userData, userLoginId } = useSelector((state) => state);
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [evaluationData, setEvaluationData] = useState({
    marks: '',
    feedback: ''
  });
  const [activeTab, setActiveTab] = useState('submitted');

  // Fetch assignment, submissions, and students on component mount
  useEffect(() => {
    fetchAssignment();
    fetchSubmissions();
    fetchStats();
  }, [assignmentId]);

  // Fetch students when assignment data is available
  useEffect(() => {
    if (assignment) {
      fetchStudents();
    }
  }, [assignment]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/assignment/getAssignments`, {
        _id: assignmentId
      });
      if (response.data.assignments && response.data.assignments.length > 0) {
        setAssignment(response.data.assignments[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      setError('Failed to load assignment details');
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/submission/getSubmissionsByAssignment/${assignmentId}`);
      setSubmissions(response.data.submissions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/assignment/getAssignmentStats/${assignmentId}`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      console.log('Fetching students with params:', {
        branch: assignment.branch,
        semester: assignment.semester
      });
      
      // Using the correct endpoint based on our memory
      const response = await axios.post(`${API_URL}/api/student/details/getDetails`, {
        branch: assignment.branch,
        semester: assignment.semester
      });
      
      console.log('Student API response:', response.data);
      
      if (response.data && Array.isArray(response.data.user)) {
        setStudents(response.data.user);
        console.log('Students loaded:', response.data.user.length);
      } else if (response.data && Array.isArray(response.data.Student)) {
        setStudents(response.data.Student);
        console.log('Students loaded (alternative):', response.data.Student.length);
      } else {
        console.error('Unexpected student data structure:', response.data);
        setError('Failed to load student data. Unexpected data structure.');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Try an alternative endpoint if the first one fails
      try {
        console.log('Trying alternative endpoint');
        const fallbackResponse = await axios.get(`${API_URL}/api/student/getBranchSemester/${assignment.branch}/${assignment.semester}`);
        
        console.log('Fallback student API response:', fallbackResponse.data);
        
        if (fallbackResponse.data && Array.isArray(fallbackResponse.data.students)) {
          setStudents(fallbackResponse.data.students);
          console.log('Students loaded from fallback:', fallbackResponse.data.students.length);
        } else if (fallbackResponse.data && Array.isArray(fallbackResponse.data.Student)) {
          setStudents(fallbackResponse.data.Student);
          console.log('Students loaded from fallback (alt property):', fallbackResponse.data.Student.length);
        } else {
          setError('Failed to load student data. Please try refreshing the page.');
          setStudents([]);
        }
      } catch (fallbackError) {
        console.error('Error with fallback endpoint:', fallbackError);
        setError('Failed to load students. Please try refreshing the page.');
        setStudents([]);
      }
    }
  };

  const handleEvaluateClick = (submission) => {
    setCurrentSubmission(submission);
    setEvaluationData({
      marks: submission.marks || '',
      feedback: submission.feedback || ''
    });
    setShowEvaluateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvaluationData({
      ...evaluationData,
      [name]: value
    });
  };

  const handleEvaluateSubmission = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`${API_URL}/api/submission/evaluateSubmission/${currentSubmission._id}`, evaluationData);
      fetchSubmissions();
      fetchStats();
      setShowEvaluateModal(false);
      setLoading(false);
    } catch (error) {
      console.error('Error evaluating submission:', error);
      setError('Failed to evaluate submission');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.enrollmentNo === studentId);
    return student ? `${student.firstName} ${student.lastName}` : studentId;
  };

  const getNonSubmittedStudents = () => {
    if (!students || !submissions) return [];
    
    const submittedStudentIds = submissions.map(sub => sub.studentId);
    return students.filter(student => !submittedStudentIds.includes(student.enrollmentNo));
  };

  const getAssessmentBadgeColor = (type) => {
    switch(type) {
      case 'ISA1': return 'primary';
      case 'ISA2': return 'info';
      case 'ESA': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Evaluated': return 'success';
      case 'Late': return 'warning';
      default: return 'primary';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Evaluated': return <FaCheck className="me-1" />;
      case 'Late': return <FaClock className="me-1" />;
      default: return <FaHourglassHalf className="me-1" />;
    }
  };

  if (loading && !assignment) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading assignment details...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 bg-light" style={{ minHeight: '100vh' }}>
      <Row>
        <Col>
          <Button 
            variant="outline-secondary" 
            className="mb-4 d-flex align-items-center" 
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="me-2" /> Back to Assignments
          </Button>
          
          {assignment && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0">{assignment.title}</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col lg={8}>
                    <h5 className="mb-3">Description</h5>
                    <p className="text-muted">{assignment.description}</p>
                  </Col>
                  <Col lg={4}>
                    <div className="bg-light p-3 rounded">
                      <h5 className="mb-3">Details</h5>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold">Subject:</span>
                        <span>{assignment.subject}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold">Branch:</span>
                        <span>{assignment.branch}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold">Semester:</span>
                        <span>{assignment.semester}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold">Due Date:</span>
                        <span>{formatDate(assignment.dueDate)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold">Total Marks:</span>
                        <span>{assignment.totalMarks}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Assessment Type:</span>
                        <Badge bg={getAssessmentBadgeColor(assignment.assessmentType)}>
                          {assignment.assessmentType}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {stats && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Submission Statistics</h5>
              </Card.Header>
              <Card.Body>
                <Row className="text-center">
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="p-3 rounded bg-primary bg-opacity-10">
                      <h2 className="display-4 fw-bold text-primary">{stats.totalSubmissions}</h2>
                      <p className="mb-0 text-muted">Total Submissions</p>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="p-3 rounded bg-success bg-opacity-10">
                      <h2 className="display-4 fw-bold text-success">{stats.evaluatedCount}</h2>
                      <p className="mb-0 text-muted">Evaluated</p>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3 mb-md-0">
                    <div className="p-3 rounded bg-warning bg-opacity-10">
                      <h2 className="display-4 fw-bold text-warning">{stats.pendingCount}</h2>
                      <p className="mb-0 text-muted">Pending Evaluation</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="p-3 rounded bg-danger bg-opacity-10">
                      <h2 className="display-4 fw-bold text-danger">{stats.lateCount}</h2>
                      <p className="mb-0 text-muted">Late Submissions</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <Card className="shadow-sm">
            <Card.Header className="bg-white p-0">
              <Tab.Container id="submissions-tabs" defaultActiveKey="submitted" onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="submitted">
                      Submitted ({submissions.length})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="not-submitted">
                      Not Submitted ({getNonSubmittedStudents().length})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Tab.Container>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Tab.Content>
                <Tab.Pane active={activeTab === 'submitted'}>
                  {loading && submissions.length === 0 ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-3">Loading submissions...</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Student</th>
                            <th>Submission Date</th>
                            <th>File</th>
                            <th>Status</th>
                            <th>Marks</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.length > 0 ? (
                            submissions.map((submission, index) => (
                              <tr key={submission._id}>
                                <td>{index + 1}</td>
                                <td>
                                  <div className="fw-bold">{getStudentName(submission.studentId)}</div>
                                  <small className="text-muted">{submission.studentId}</small>
                                </td>
                                <td>{formatDate(submission.submissionDate)}</td>
                                <td>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    href={`${API_URL}${submission.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="d-flex align-items-center"
                                  >
                                    <FaDownload className="me-2" /> {submission.fileName}
                                  </Button>
                                </td>
                                <td>
                                  <Badge 
                                    bg={getStatusBadgeColor(submission.status)}
                                    className="d-flex align-items-center w-100"
                                    style={{ maxWidth: "120px" }}
                                  >
                                    {getStatusIcon(submission.status)} {submission.status}
                                  </Badge>
                                </td>
                                <td>
                                  {submission.marks !== null ? (
                                    <span className="fw-bold">{submission.marks}/{assignment?.totalMarks}</span>
                                  ) : (
                                    <span className="text-muted fst-italic">Not evaluated</span>
                                  )}
                                </td>
                                <td className="text-center">
                                  <Button 
                                    variant={submission.marks !== null ? "outline-success" : "success"}
                                    size="sm"
                                    onClick={() => handleEvaluateClick(submission)}
                                    className="d-flex align-items-center mx-auto"
                                  >
                                    <FaEdit className="me-2" /> 
                                    {submission.marks !== null ? 'Update' : 'Evaluate'}
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center py-4">
                                <p className="text-muted mb-0">No submissions found</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Tab.Pane>
                
                <Tab.Pane active={activeTab === 'not-submitted'}>
                  <div className="table-responsive">
                    <Table hover className="align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Enrollment No</th>
                          <th>Student Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getNonSubmittedStudents().length > 0 ? (
                          getNonSubmittedStudents().map((student, index) => (
                            <tr key={student._id}>
                              <td>{index + 1}</td>
                              <td>{student.enrollmentNo}</td>
                              <td>{`${student.firstName} ${student.lastName}`}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-4">
                              <p className="text-success mb-0">
                                <FaCheck className="me-2" />
                                All students have submitted their assignments
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Evaluate Submission Modal */}
      <Modal show={showEvaluateModal} onHide={() => setShowEvaluateModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FaEdit className="me-2" /> 
            Evaluate Submission
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSubmission && (
            <>
              <div className="bg-light p-3 rounded mb-4">
                <h6 className="text-muted mb-3">Submission Details</h6>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">Student:</span>
                  <span>{getStudentName(currentSubmission.studentId)}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">Enrollment No:</span>
                  <span>{currentSubmission.studentId}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">Submission Date:</span>
                  <span>{formatDate(currentSubmission.submissionDate)}</span>
                </div>
                
                <div className="d-flex justify-content-between">
                  <span className="fw-bold">File:</span>
                  <a 
                    href={`${API_URL}${currentSubmission.fileUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    {currentSubmission.fileName}
                  </a>
                </div>
              </div>
              
              <Form onSubmit={handleEvaluateSubmission}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <span className="fw-bold">Marks</span> (out of {assignment?.totalMarks})
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="marks"
                    value={evaluationData.marks}
                    onChange={handleInputChange}
                    min="0"
                    max={assignment?.totalMarks}
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter marks between 0 and {assignment?.totalMarks}.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <span className="fw-bold">Feedback</span> (optional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="feedback"
                    value={evaluationData.feedback}
                    onChange={handleInputChange}
                    placeholder="Provide constructive feedback to the student..."
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="outline-secondary" className="me-2" onClick={() => setShowEvaluateModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck className="me-2" />
                        Save Evaluation
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AssignmentSubmissions;