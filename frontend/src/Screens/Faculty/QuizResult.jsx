import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const QuizResult = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { userData, userLoginId } = useSelector((state) => state);
  
  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch submission details on component mount
  useEffect(() => {
    fetchSubmissionResult();
  }, [submissionId]);

  const fetchSubmissionResult = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/quizSubmission/getQuizSubmissionResult/${submissionId}`);
      setSubmissionData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching submission result:', error);
      setError('Failed to load submission details');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
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
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!submissionData) {
    return null;
  }

  const { submission, result, detailedResults } = submissionData;
  const quiz = submission.quiz;

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Button variant="secondary" className="mb-3" onClick={() => navigate(-1)}>
            &larr; Back to Submissions
          </Button>
          
          <Card className="mb-4">
            <Card.Header>
              <h4>Quiz Result: {quiz.title}</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Student ID:</strong> {submission.studentId}</p>
                  <p><strong>Start Time:</strong> {formatDate(submission.startTime)}</p>
                  <p><strong>End Time:</strong> {formatDate(submission.endTime)}</p>
                  <p>
                    <strong>Duration:</strong> {Math.round((new Date(submission.endTime) - new Date(submission.startTime)) / 60000)} minutes
                  </p>
                </Col>
                <Col md={6}>
                  <p><strong>Subject:</strong> {quiz.subject}</p>
                  <p><strong>Total Questions:</strong> {result.totalQuestions}</p>
                  <p><strong>Answered Questions:</strong> {result.answeredQuestions}</p>
                  <p><strong>Correct Answers:</strong> {result.correctAnswers}</p>
                </Col>
              </Row>
              
              <hr />
              
              <Row className="mt-3">
                <Col md={12}>
                  <h5>Score Summary</h5>
                  <div className="d-flex align-items-center mt-3">
                    <h3 className="mb-0 me-3">
                      {submission.totalMarksObtained}/{quiz.totalMarks}
                    </h3>
                    <div style={{ flex: 1 }}>
                      <ProgressBar 
                        now={result.percentage} 
                        label={`${result.percentage.toFixed(1)}%`}
                        variant={
                          result.percentage >= 70 ? 'success' :
                          result.percentage >= 40 ? 'warning' :
                          'danger'
                        }
                        style={{ height: '25px' }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5>Detailed Question Analysis</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup>
                {detailedResults.map((item, index) => (
                  <ListGroup.Item key={index} className="mb-3">
                    <div>
                      <h6>
                        <span className="me-2">Q{index + 1}.</span>
                        {item.question}
                        <Badge 
                          bg={item.isCorrect ? 'success' : 'danger'} 
                          className="ms-2"
                        >
                          {item.isCorrect ? 'Correct' : 'Incorrect'}
                        </Badge>
                        <Badge bg="info" className="ms-2">
                          {item.marksObtained}/{item.possibleMarks} marks
                        </Badge>
                      </h6>
                      
                      <div className="mt-3">
                        <p><strong>Options:</strong></p>
                        <ul className="list-unstyled">
                          {item.options.map((option, optIndex) => (
                            <li 
                              key={optIndex} 
                              className={`p-2 rounded ${
                                option.text === item.correctAnswer && option.text === item.selectedAnswer
                                  ? 'bg-success text-white'
                                  : option.text === item.correctAnswer
                                  ? 'bg-success bg-opacity-25'
                                  : option.text === item.selectedAnswer && !item.isCorrect
                                  ? 'bg-danger bg-opacity-25'
                                  : ''
                              }`}
                              style={{ marginBottom: '5px' }}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option.text}
                              {option.text === item.correctAnswer && (
                                <span className="ms-2">✓ (Correct Answer)</span>
                              )}
                              {option.text === item.selectedAnswer && option.text !== item.correctAnswer && (
                                <span className="ms-2">✗ (Selected Answer)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {!item.selectedAnswer && (
                        <p className="text-muted mt-2">No answer selected</p>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QuizResult;
