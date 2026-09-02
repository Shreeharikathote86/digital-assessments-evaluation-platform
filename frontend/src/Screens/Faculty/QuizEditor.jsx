import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge, Alert, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { FaArrowLeft, FaPlus, FaPencilAlt, FaTrash, FaRobot, FaCheck } from 'react-icons/fa';

const QuizEditor = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { userData, userLoginId } = useSelector((state) => state);
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);
  const [questionFormData, setQuestionFormData] = useState({
    questionText: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: '',
    marks: 1,
    difficulty: 'Medium'
  });
  const [aiGenerateData, setAiGenerateData] = useState({
    topic: '',
    numQuestions: 5,
    difficulty: 'Medium'
  });

  // Fetch quiz on component mount
  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/quiz/getQuizById/${quizId}`);
      setQuiz(response.data.quiz);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Failed to load quiz details');
      setLoading(false);
    }
  };

  const handleQuestionInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionFormData({
      ...questionFormData,
      [name]: value
    });
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...questionFormData.options];
    
    if (field === 'isCorrect') {
      // Uncheck all other options
      updatedOptions.forEach((option, i) => {
        updatedOptions[i].isCorrect = i === index;
      });
      
      // Update correct answer
      setQuestionFormData({
        ...questionFormData,
        options: updatedOptions,
        correctAnswer: updatedOptions[index].text
      });
    } else {
      updatedOptions[index].text = value;
      
      // If this is the correct option, update correctAnswer as well
      if (updatedOptions[index].isCorrect) {
        setQuestionFormData({
          ...questionFormData,
          options: updatedOptions,
          correctAnswer: value
        });
      } else {
        setQuestionFormData({
          ...questionFormData,
          options: updatedOptions
        });
      }
    }
  };

  const handleAddQuestion = () => {
    setEditIndex(-1);
    setQuestionFormData({
      questionText: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: '',
      marks: 1,
      difficulty: 'Medium'
    });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question, index) => {
    setEditIndex(index);
    setQuestionFormData({
      questionText: question.questionText,
      options: question.options.map(opt => ({ text: opt.text, isCorrect: opt.isCorrect })),
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      difficulty: question.difficulty
    });
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = [...quiz.questions];
      updatedQuestions.splice(index, 1);
      
      updateQuiz({
        questions: updatedQuestions
      });
    }
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    
    // Validate form
    const correctOptionSelected = questionFormData.options.some(opt => opt.isCorrect);
    if (!correctOptionSelected) {
      setError('Please select a correct answer');
      return;
    }
    
    const updatedQuestions = [...quiz.questions];
    
    if (editIndex >= 0) {
      // Edit existing question
      updatedQuestions[editIndex] = questionFormData;
    } else {
      // Add new question
      updatedQuestions.push(questionFormData);
    }
    
    updateQuiz({
      questions: updatedQuestions
    });
    
    setShowQuestionModal(false);
  };

  const handleAiInputChange = (e) => {
    const { name, value } = e.target;
    setAiGenerateData({
      ...aiGenerateData,
      [name]: value
    });
  };

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/quiz/generateQuizQuestions/${quizId}`, aiGenerateData);
      
      fetchQuiz();
      setShowGenerateModal(false);
      setLoading(false);
    } catch (error) {
      console.error('Error generating questions:', error);
      setError('Failed to generate questions. Please check your Gemini API key configuration.');
      setLoading(false);
    }
  };

  const updateQuiz = async (updates) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/api/quiz/updateQuiz/${quizId}`, updates);
      fetchQuiz();
      setLoading(false);
    } catch (error) {
      console.error('Error updating quiz:', error);
      setError('Failed to update quiz');
      setLoading(false);
    }
  };

  const handlePublishQuiz = async () => {
    if (quiz.questions.length === 0) {
      setError('Cannot publish quiz without questions. Please add questions first.');
      return;
    }
    
    try {
      setLoading(true);
      await axios.put(`${API_URL}/api/quiz/updateQuiz/${quizId}`, {
        status: 'Published'
      });
      fetchQuiz();
      setLoading(false);
    } catch (error) {
      console.error('Error publishing quiz:', error);
      setError('Failed to publish quiz');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDifficultyBadgeVariant = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'Draft': return 'secondary';
      case 'Published': return 'success';
      default: return 'danger';
    }
  };

  const getAssessmentTypeBadgeVariant = (type) => {
    switch(type) {
      case 'ISA1': return 'primary';
      case 'ISA2': return 'info';
      case 'ESA': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading && !quiz) {
    return (
      <Container className="mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading quiz details...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-4 bg-light" style={{ minHeight: '100vh' }}>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button 
              variant="outline-secondary" 
              className="d-flex align-items-center" 
              onClick={() => navigate('/faculty/quizzes')}
            >
              <FaArrowLeft className="me-2" /> Back to Quizzes
            </Button>
            {quiz && quiz.status === 'Draft' && (
              <Button 
                variant="success" 
                className="d-flex align-items-center"
                onClick={handlePublishQuiz}
                disabled={quiz.questions.length === 0}
              >
                <FaCheck className="me-2" /> Publish Quiz
              </Button>
            )}
          </div>
          
          {error && (
            <Alert 
              variant="danger" 
              dismissible 
              onClose={() => setError(null)} 
              className="shadow-sm"
            >
              {error}
            </Alert>
          )}
          
          {quiz && (
            <>
              <Card className="mb-4 shadow-sm border-0 rounded-lg">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                  <h4 className="mb-0 text-primary">{quiz.title}</h4>
                  <Badge 
                    bg={getStatusBadgeVariant(quiz.status)}
                    className="py-2 px-3"
                    style={{ fontSize: '0.85rem' }}
                  >
                    {quiz.status}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">Description</h6>
                        <p className="mb-0">{quiz.description}</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="bg-light p-3 rounded">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Subject:</span>
                          <span className="fw-medium">{quiz.subject}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Branch:</span>
                          <span className="fw-medium">{quiz.branch}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Semester:</span>
                          <span className="fw-medium">{quiz.semester}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Due Date:</span>
                          <span className="fw-medium">{formatDate(quiz.dueDate)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Total Marks:</span>
                          <span className="fw-medium">{quiz.totalMarks}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Duration:</span>
                          <span className="fw-medium">{quiz.duration} minutes</span>
                        </div>
                        <div className="d-flex justify-content-between mb-0">
                          <span className="text-muted">Assessment Type:</span>
                          <Badge 
                            bg={getAssessmentTypeBadgeVariant(quiz.assessmentType)} 
                            className="py-1 px-2"
                          >
                            {quiz.assessmentType}
                          </Badge>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-0 rounded-lg">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                  <h5 className="mb-0">
                    Quiz Questions 
                    <Badge bg="primary" className="ms-2 rounded-pill">{quiz.questions.length}</Badge>
                  </h5>
                  {quiz.status === 'Draft' && (
                    <div>
                      <Button 
                        variant="outline-primary" 
                        className="me-2 d-flex align-items-center"
                        onClick={() => setShowGenerateModal(true)}
                      >
                        <FaRobot className="me-2" /> Generate with AI
                      </Button>
                      <Button 
                        variant="primary"
                        className="d-flex align-items-center"
                        onClick={handleAddQuestion}
                      >
                        <FaPlus className="me-2" /> Add Question
                      </Button>
                    </div>
                  )}
                </Card.Header>
                <Card.Body className="p-0">
                  {quiz.questions.length === 0 ? (
                    <div className="text-center p-5">
                      <div className="mb-3">
                        <img 
                          src="/api/placeholder/120/120" 
                          alt="No questions" 
                          className="mb-3" 
                          style={{ opacity: 0.5 }}
                        />
                        <h5 className="text-muted">No questions added yet</h5>
                        <p className="text-muted">Add questions manually or generate them with AI</p>
                      </div>
                      {quiz.status === 'Draft' && (
                        <div>
                          <Button 
                            variant="outline-primary" 
                            className="me-3 d-flex align-items-center"
                            onClick={() => setShowGenerateModal(true)}
                            style={{ display: 'inline-flex' }}
                          >
                            <FaRobot className="me-2" /> Generate with AI
                          </Button>
                          <Button 
                            variant="primary"
                            className="d-flex align-items-center"
                            onClick={handleAddQuestion}
                            style={{ display: 'inline-flex' }}
                          >
                            <FaPlus className="me-2" /> Add Question Manually
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="question-list">
                      {quiz.questions.map((question, index) => (
                        <div 
                          key={index} 
                          className="p-4 border-bottom"
                          style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <div 
                                  className="question-number me-3 d-flex justify-content-center align-items-center" 
                                  style={{ 
                                    backgroundColor: '#007bff', 
                                    color: 'white', 
                                    width: '30px', 
                                    height: '30px', 
                                    borderRadius: '50%', 
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {index + 1}
                                </div>
                                <h6 className="mb-0 flex-grow-1">{question.questionText}</h6>
                                <div className="ms-3">
                                  <Badge 
                                    bg="secondary" 
                                    className="me-2" 
                                    style={{ fontSize: '0.8rem' }}
                                  >
                                    {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                                  </Badge>
                                  <Badge 
                                    bg={getDifficultyBadgeVariant(question.difficulty)}
                                    style={{ fontSize: '0.8rem' }}
                                  >
                                    {question.difficulty}
                                  </Badge>
                                </div>
                              </div>
                              <div className="ms-5 mt-3">
                                <div className="row">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="col-md-6 mb-2">
                                      <div 
                                        className={`p-2 rounded ${option.isCorrect ? 'bg-success bg-opacity-10 border border-success' : 'bg-light'}`}
                                      >
                                        <span className="me-2">{String.fromCharCode(65 + optIndex)}.</span>
                                        {option.text}
                                        {option.isCorrect && (
                                          <Badge bg="success" className="ms-2">Correct</Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {quiz.status === 'Draft' && (
                              <div className="ms-3">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  className="me-2 d-flex align-items-center"
                                  onClick={() => handleEditQuestion(question, index)}
                                >
                                  <FaPencilAlt className="me-1" /> Edit
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  className="d-flex align-items-center mt-2"
                                  onClick={() => handleDeleteQuestion(index)}
                                >
                                  <FaTrash className="me-1" /> Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>

      {/* Question Modal */}
      <Modal 
        show={showQuestionModal} 
        onHide={() => setShowQuestionModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{editIndex >= 0 ? 'Edit Question' : 'Add Question'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSaveQuestion}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Question Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="questionText"
                value={questionFormData.questionText}
                onChange={handleQuestionInputChange}
                required
                className="border-primary"
                placeholder="Enter your question here..."
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Options</Form.Label>
              <div className="options-container">
                {questionFormData.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`d-flex align-items-center mb-3 p-2 rounded ${
                      option.isCorrect ? 'bg-success bg-opacity-10' : ''
                    }`}
                  >
                    <div className="me-3 d-flex align-items-center">
                      <Form.Check
                        type="radio"
                        name="correctOption"
                        id={`option-${index}`}
                        checked={option.isCorrect}
                        onChange={() => handleOptionChange(index, 'isCorrect', true)}
                        className="form-check-input"
                      />
                    </div>
                    <div className="option-letter me-3 d-flex justify-content-center align-items-center" 
                      style={{ 
                        backgroundColor: '#6c757d', 
                        color: 'white', 
                        width: '25px', 
                        height: '25px', 
                        borderRadius: '50%', 
                        fontSize: '0.8rem'
                      }}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Form.Control
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      required
                      className="border-0 bg-transparent flex-grow-1"
                    />
                  </div>
                ))}
                <Form.Text className="text-muted">
                  Select the radio button next to the correct answer.
                </Form.Text>
              </div>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Marks</Form.Label>
                  <Form.Control
                    type="number"
                    name="marks"
                    value={questionFormData.marks}
                    onChange={handleQuestionInputChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Difficulty</Form.Label>
                  <Form.Select
                    name="difficulty"
                    value={questionFormData.difficulty}
                    onChange={handleQuestionInputChange}
                    required
                    className="border-0 p-2"
                    style={{ backgroundColor: '#f8f9fa' }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="light" className="me-2" onClick={() => setShowQuestionModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : (editIndex >= 0 ? 'Update Question' : 'Save Question')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Generate Questions Modal */}
      <Modal 
        show={showGenerateModal} 
        onHide={() => !loading && setShowGenerateModal(false)} 
        backdrop="static" 
        keyboard={!loading}
        centered
      >
        <Modal.Header closeButton={!loading} className="bg-light">
          <Modal.Title className="d-flex align-items-center">
            <FaRobot className="text-primary me-2" />
            {loading ? 'Generating Quiz Questions...' : 'Generate Quiz Questions with AI'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem', opacity: 0.6 }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              <h5 className="mb-3">Generating Quiz Questions</h5>
              <p className="text-muted mb-4">
                Please wait while our AI generates {aiGenerateData.numQuestions} {aiGenerateData.difficulty.toLowerCase()} level questions about {aiGenerateData.topic}.
              </p>
              <div className="progress mb-3" style={{ height: '8px' }}>
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <p className="small text-muted">This may take up to 30 seconds depending on the complexity of the topic.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-light rounded">
                <p className="mb-0">Use Gemini AI to automatically generate quiz questions based on your topic. The AI will create multiple-choice questions with correct answers marked.</p>
              </div>
              
              <Form onSubmit={handleGenerateQuestions}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Topic</Form.Label>
                  <Form.Control
                    type="text"
                    name="topic"
                    value={aiGenerateData.topic}
                    onChange={handleAiInputChange}
                    placeholder="e.g., Data Structures, Computer Networks, etc."
                    required
                    className="border-primary"
                  />
                  <Form.Text className="text-muted">
                    Be specific for better results. For example, "Binary Search Trees in Java" instead of just "Data Structures".
                  </Form.Text>
                </Form.Group>

                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Number of Questions</Form.Label>
                      <Form.Control
                        type="number"
                        name="numQuestions"
                        value={aiGenerateData.numQuestions}
                        onChange={handleAiInputChange}
                        min="1"
                        max="20"
                        required
                      />
                      <Form.Text className="text-muted">
                        We recommend 5-10 questions for best results.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-medium">Difficulty Level</Form.Label>
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
                      <Form.Text className="text-muted">
                        Choose the appropriate difficulty for your students.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-4">
                  <Button 
                    variant="light" 
                    className="me-2" 
                    onClick={() => setShowGenerateModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    className="d-flex align-items-center"
                  >
                    <FaRobot className="me-2" />
                    Generate Questions
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

export default QuizEditor;