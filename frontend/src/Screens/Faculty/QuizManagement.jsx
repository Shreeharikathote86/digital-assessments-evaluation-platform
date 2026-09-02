import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge, Modal, Alert, Tabs, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const QuizManagement = () => {
  const navigate = useNavigate();
  const { userData, userLoginId } = useSelector((state) => state);
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    branch: '',
    semester: '',
    dueDate: '',
    totalMarks: '',
    duration: '',
    assessmentType: 'Other'
  });
  const [aiGenerateData, setAiGenerateData] = useState({
    topic: '',
    numQuestions: 5,
    difficulty: 'Medium'
  });

  // Fetch quizzes, subjects, and branches on component mount
  useEffect(() => {
    fetchQuizzes();
    fetchSubjects();
    fetchBranches();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/quiz/getQuizzes`, {
        createdBy: userLoginId
      });
      setQuizzes(response.data.quizzes || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to load quizzes');
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subject/getSubject`);
      setSubjects(response.data.subject || []);
      console.log('Subjects:', response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/branch/getBranch`);
      setBranches(response.data.branches || []);
      console.log('Branches:', response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAiInputChange = (e) => {
    const { name, value } = e.target;
    setAiGenerateData({
      ...aiGenerateData,
      [name]: value
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Validate all required fields
      if (!formData.title || !formData.description || !formData.subject || 
          !formData.branch || !formData.semester || !formData.dueDate || 
          !formData.totalMarks || !formData.duration || !formData.assessmentType) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Convert numeric fields to numbers
      const semesterValue = parseInt(formData.semester);
      const totalMarksValue = parseInt(formData.totalMarks);
      const durationValue = parseInt(formData.duration);
      
      // Get faculty ID from localStorage as a workaround
      const storedLoginId = localStorage.getItem('loginid') || '123456';
      
      const quizData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        branch: formData.branch,
        semester: semesterValue,
        dueDate: formData.dueDate,
        totalMarks: totalMarksValue,
        duration: durationValue,
        assessmentType: formData.assessmentType,
        createdBy: storedLoginId, // Use the ID from localStorage
        status: 'Draft' // Set initial status to Draft
      };
      
      console.log('Sending quiz data:', quizData);
      
      const response = await axios.post(`${API_URL}/api/quiz/createQuiz`, quizData);
      console.log('Quiz creation response:', response.data);
      
      setFormData({
        title: '',
        description: '',
        subject: '',
        branch: '',
        semester: '',
        dueDate: '',
        totalMarks: '',
        duration: '',
        assessmentType: 'Other'
      });
      
      fetchQuizzes();
      setShowCreateModal(false);
      setLoading(false);
      
      // Set current quiz for AI generation
      setCurrentQuiz(response.data.quiz);
      setShowGenerateModal(true);
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.message || 'Failed to create quiz. Please try again.');
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/quiz/generateQuizQuestions/${currentQuiz._id}`, aiGenerateData);
      
      fetchQuizzes();
      setShowGenerateModal(false);
      setLoading(false);
      
      // Navigate to quiz editor
      navigate(`/faculty/quiz-editor/${currentQuiz._id}`);
    } catch (error) {
      console.error('Error generating questions:', error);
      setError('Failed to generate questions. Please check your Gemini API key configuration.');
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/api/quiz/deleteQuiz/${id}`);
        fetchQuizzes();
        setLoading(false);
      } catch (error) {
        console.error('Error deleting quiz:', error);
        setError('Failed to delete quiz');
        setLoading(false);
      }
    }
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/faculty/quiz-editor/${quizId}`);
  };

  const handleViewSubmissions = (quizId) => {
    navigate(`/faculty/quiz-submissions/${quizId}`);
  };

  const handlePublishQuiz = async (quiz) => {
    if (quiz.questions.length === 0) {
      setError('Cannot publish quiz without questions. Please add questions first.');
      return;
    }
    
    try {
      setLoading(true);
      await axios.put(`${API_URL}/api/quiz/updateQuiz/${quiz._id}`, {
        status: 'Published'
      });
      fetchQuizzes();
      setLoading(false);
    } catch (error) {
      console.error('Error publishing quiz:', error);
      setError('Failed to publish quiz');
      setLoading(false);
    }
  };

  const handleCloseQuiz = async (quiz) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/api/quiz/updateQuiz/${quiz._id}`, {
        status: 'Closed'
      });
      fetchQuizzes();
      setLoading(false);
    } catch (error) {
      console.error('Error closing quiz:', error);
      setError('Failed to close quiz');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Quiz Management</h4>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create New Quiz
              </Button>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Tabs defaultActiveKey="all" className="mb-3">
                <Tab eventKey="all" title="All Quizzes">
                  {renderQuizTable(quizzes)}
                </Tab>
                <Tab eventKey="draft" title="Drafts">
                  {renderQuizTable(quizzes.filter(quiz => quiz.status === 'Draft'))}
                </Tab>
                <Tab eventKey="published" title="Published">
                  {renderQuizTable(quizzes.filter(quiz => quiz.status === 'Published'))}
                </Tab>
                <Tab eventKey="closed" title="Closed">
                  {renderQuizTable(quizzes.filter(quiz => quiz.status === 'Closed'))}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Quiz Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateQuiz}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Marks</Form.Label>
                  <Form.Control
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Assessment Type</Form.Label>
                  <Form.Select
                    name="assessmentType"
                    value={formData.assessmentType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="ISA1">ISA1</option>
                    <option value="ISA2">ISA2</option>
                    <option value="ESA">ESA</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Quiz'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Generate Questions Modal */}
      <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generate Quiz Questions with AI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Use Gemini AI to automatically generate quiz questions based on your topic.</p>
          
          <Form onSubmit={handleGenerateQuestions}>
            <Form.Group className="mb-3">
              <Form.Label>Topic</Form.Label>
              <Form.Control
                type="text"
                name="topic"
                value={aiGenerateData.topic}
                onChange={handleAiInputChange}
                placeholder="e.g., Data Structures, Computer Networks, etc."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Number of Questions</Form.Label>
              <Form.Control
                type="number"
                name="numQuestions"
                value={aiGenerateData.numQuestions}
                onChange={handleAiInputChange}
                min="1"
                max="20"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Difficulty Level</Form.Label>
              <Form.Select
                name="difficulty"
                value={aiGenerateData.difficulty}
                onChange={handleAiInputChange}
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => {
                setShowGenerateModal(false);
                navigate(`/faculty/quiz-editor/${currentQuiz._id}`);
              }}>
                Skip (Create Manually)
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Generating...' : 'Generate Questions'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );

  function renderQuizTable(quizList) {
    return (
      loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Subject</th>
              <th>Branch</th>
              <th>Semester</th>
              <th>Due Date</th>
              <th>Questions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizList.length > 0 ? (
              quizList.map((quiz, index) => (
                <tr key={quiz._id}>
                  <td>{index + 1}</td>
                  <td>{quiz.title}</td>
                  <td>{quiz.subject}</td>
                  <td>{quiz.branch}</td>
                  <td>{quiz.semester}</td>
                  <td>{formatDate(quiz.dueDate)}</td>
                  <td>{quiz.questions.length}</td>
                  <td>
                    <Badge bg={
                      quiz.status === 'Draft' ? 'secondary' :
                      quiz.status === 'Published' ? 'success' :
                      'danger'
                    }>
                      {quiz.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-1">
                      <Button 
                        variant="info" 
                        size="sm" 
                        onClick={() => handleEditQuiz(quiz._id)}
                      >
                        Edit
                      </Button>
                      
                      {quiz.status === 'Draft' && (
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handlePublishQuiz(quiz)}
                          disabled={quiz.questions.length === 0}
                        >
                          Publish
                        </Button>
                      )}
                      
                      {quiz.status === 'Published' && (
                        <>
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => handleCloseQuiz(quiz)}
                          >
                            Close
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleViewSubmissions(quiz._id)}
                          >
                            View Submissions
                          </Button>
                        </>
                      )}
                      
                      {quiz.status === 'Closed' && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleViewSubmissions(quiz._id)}
                        >
                          View Results
                        </Button>
                      )}
                      
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">No quizzes found</td>
              </tr>
            )}
          </tbody>
        </Table>
      )
    );
  }
};

export default QuizManagement;
