import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, ProgressBar, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { userData, userLoginId } = useSelector((state) => state);
  
  const [quiz, setQuiz] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const timerRef = useRef(null);

  // Start or continue quiz attempt on component mount
  useEffect(() => {
    startQuizAttempt();
    
    // Cleanup timer on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizId]);

  // Update selected answers when submission changes
  useEffect(() => {
    if (submission && submission.answers) {
      const answers = {};
      submission.answers.forEach(answer => {
        answers[answer.questionId] = answer.selectedAnswer;
      });
      setSelectedAnswers(answers);
    }
  }, [submission]);

  const startQuizAttempt = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Get student ID from Redux or localStorage
      let studentIdToUse = userLoginId;
      
      // If userLoginId is empty, try to get it from localStorage
      if (!studentIdToUse) {
        studentIdToUse = localStorage.getItem('userLoginId');
        console.log('Retrieved studentId from localStorage:', studentIdToUse);
      }
      
      // If still empty, try to get from userData
      if (!studentIdToUse && userData && userData.loginid) {
        studentIdToUse = userData.loginid;
        console.log('Retrieved studentId from userData:', studentIdToUse);
      }
      
      // If still empty, use a fallback ID for testing purposes
      if (!studentIdToUse) {
        console.log('Using fallback student ID for testing');
        studentIdToUse = '123456'; // Fallback ID for testing
      }
      
      if (!studentIdToUse) {
        console.error('Student ID not found');
        setError('Student ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('Starting quiz attempt with studentId:', studentIdToUse);
      
      const response = await axios.post(`${API_URL}/api/quizSubmission/startQuizAttempt`, {
        quizId,
        studentId: studentIdToUse
      });
      
      setQuiz(response.data.quiz);
      setSubmission(response.data.submission);
      
      // Set up timer
      if (response.data.quiz.duration) {
        const endTime = new Date(response.data.submission.startTime);
        endTime.setMinutes(endTime.getMinutes() + response.data.quiz.duration);
        
        startTimer(endTime);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Failed to start quiz attempt');
      } else {
        setError('Failed to start quiz attempt');
      }
      setLoading(false);
    }
  };

  const startTimer = (endTime) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Update time left immediately
    updateTimeLeft(endTime);
    
    // Set up interval to update time left every second
    timerRef.current = setInterval(() => {
      const timeRemaining = updateTimeLeft(endTime);
      
      // If time is up, submit the quiz automatically
      if (timeRemaining <= 0) {
        clearInterval(timerRef.current);
        handleSubmitQuiz();
      }
    }, 1000);
  };

  const updateTimeLeft = (endTime) => {
    const now = new Date();
    const timeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
    setTimeLeft(timeRemaining);
    return timeRemaining;
  };

  const formatTimeLeft = () => {
    if (timeLeft === null) return '--:--';
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (questionId, answer) => {
    // Update local state
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
    
    try {
      // Save answer to server
      await axios.post(`${API_URL}/api/quizSubmission/submitQuizAnswer/${submission._id}`, {
        questionId,
        selectedAnswer: answer
      });
    } catch (error) {
      console.error('Error saving answer:', error);
      // Don't show error to user to avoid disrupting the quiz experience
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/api/quizSubmission/completeQuizAttempt/${submission._id}`);
      
      // Navigate to result page
      navigate(`/student/quiz-result/${submission._id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz');
      setSubmitting(false);
    }
  };

  if (loading && !quiz) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/student/quiz-list')}>
          Back to Quizzes
        </Button>
      </Container>
    );
  }

  if (!quiz || !submission) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestion._id] !== undefined;
  const totalAnswered = Object.keys(selectedAnswers).length;

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={9}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>{quiz.title}</h4>
              <div className="d-flex align-items-center">
                <span className="me-2">Time Left:</span>
                <span className={`fw-bold ${timeLeft < 60 ? 'text-danger' : ''}`}>
                  {formatTimeLeft()}
                </span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h5>Question {currentQuestionIndex + 1} of {quiz.questions.length}</h5>
                <ProgressBar 
                  now={(currentQuestionIndex + 1) / quiz.questions.length * 100} 
                  style={{ height: '5px' }}
                />
              </div>
              
              <div className="mb-4">
                <h5>{currentQuestion.questionText}</h5>
                <Form>
                  {currentQuestion.options.map((option, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      id={`option-${index}`}
                      name="quizOption"
                      label={option.text}
                      checked={selectedAnswers[currentQuestion._id] === option.text}
                      onChange={() => handleAnswerSelect(currentQuestion._id, option.text)}
                      className="mb-2 p-2"
                    />
                  ))}
                </Form>
              </div>
              
              <div className="d-flex justify-content-between">
                <Button 
                  variant="outline-primary" 
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <Button 
                    variant="primary" 
                    onClick={handleNextQuestion}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    variant="success" 
                    onClick={() => setShowConfirmModal(true)}
                  >
                    Finish Quiz
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card>
            <Card.Header>
              <h5>Question Navigator</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <p>
                  <strong>Progress:</strong> {totalAnswered} of {quiz.questions.length} answered
                </p>
                <ProgressBar 
                  now={totalAnswered / quiz.questions.length * 100} 
                  variant="success"
                  style={{ height: '10px' }}
                />
              </div>
              
              <div className="d-flex flex-wrap gap-2">
                {quiz.questions.map((question, index) => (
                  <Button
                    key={index}
                    variant={
                      currentQuestionIndex === index
                        ? 'primary'
                        : selectedAnswers[question._id] !== undefined
                        ? 'success'
                        : 'outline-secondary'
                    }
                    size="sm"
                    onClick={() => handleJumpToQuestion(index)}
                    style={{ width: '40px', height: '40px' }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="success" 
                  className="w-100"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Submit Quiz
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirm Submit Modal */}
      <Modal show={showConfirmModal} onHide={() => !submitting && setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to submit your quiz?</p>
          <p>
            <strong>Progress:</strong> {totalAnswered} of {quiz.questions.length} questions answered
            {totalAnswered < quiz.questions.length && (
              <span className="text-danger">
                <br />
                Warning: {quiz.questions.length - totalAnswered} questions are unanswered.
              </span>
            )}
          </p>
          <p>You won't be able to change your answers after submission.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmModal(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitQuiz}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default QuizAttempt;
