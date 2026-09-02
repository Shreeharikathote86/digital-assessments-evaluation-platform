import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const QuizList = () => {
  const navigate = useNavigate();
  const { userData, userLoginId } = useSelector((state) => state);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch quizzes and submissions on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchQuizzes();
      await fetchSubmissions();
      console.log('Both quizzes and submissions loaded');
    };
    
    loadData();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Get the base API URL from the environment
      const baseApiUrl = process.env.REACT_APP_APILINK || API_URL;
      console.log('Using API URL:', baseApiUrl);
      
      // Try multiple approaches to fetch quizzes
      let fetchedQuizzes = [];
      let fetchSuccess = false;
      
      // Approach 1: Direct API call with empty query (this is how faculty section does it)
      try {
        console.log('Approach 1: Fetching all quizzes with empty query');
        const directResponse = await axios.post(`${baseApiUrl}/quiz/getQuizzes`, {});
        console.log('Direct quiz response:', directResponse.data);
        
        if (directResponse.data.quizzes && directResponse.data.quizzes.length > 0) {
          fetchedQuizzes = directResponse.data.quizzes;
          fetchSuccess = true;
          console.log(`Approach 1 successful: Found ${fetchedQuizzes.length} quizzes`);
        }
      } catch (directError) {
        console.error('Approach 1 failed:', directError);
      }
      
      // Approach 2: Try with Published status filter if approach 1 failed
      if (!fetchSuccess) {
        try {
          console.log('Approach 2: Fetching published quizzes');
          const publishedResponse = await axios.post(`${baseApiUrl}/quiz/getQuizzes`, {
            status: 'Published'
          });
          
          console.log('Published quiz response:', publishedResponse.data);
          
          if (publishedResponse.data.quizzes && publishedResponse.data.quizzes.length > 0) {
            fetchedQuizzes = publishedResponse.data.quizzes;
            fetchSuccess = true;
            console.log(`Approach 2 successful: Found ${fetchedQuizzes.length} quizzes`);
          }
        } catch (publishedError) {
          console.error('Approach 2 failed:', publishedError);
        }
      }
      
      // Approach 3: Try legacy API format if previous approaches failed
      if (!fetchSuccess) {
        try {
          console.log('Approach 3: Trying legacy API format');
          const legacyResponse = await axios.post(`${API_URL}/api/quiz/getQuizzes`, {});
          
          console.log('Legacy quiz response:', legacyResponse.data);
          
          if (legacyResponse.data.quizzes && legacyResponse.data.quizzes.length > 0) {
            fetchedQuizzes = legacyResponse.data.quizzes;
            fetchSuccess = true;
            console.log(`Approach 3 successful: Found ${fetchedQuizzes.length} quizzes`);
          }
        } catch (legacyError) {
          console.error('Approach 3 failed:', legacyError);
        }
      }
      
      // Set the quizzes in state
      if (fetchSuccess) {
        console.log('Setting quizzes in state:', fetchedQuizzes);
        setQuizzes(fetchedQuizzes);
      } else {
        console.error('All quiz fetch approaches failed');
        setError('Could not load quizzes. Please try again later.');
        setQuizzes([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in main quiz fetching process:', error);
      setError('Failed to load quizzes. Please try again later.');
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // Get student ID from Redux or localStorage
      let studentIdToUse = userLoginId;
      
      // If userLoginId is empty, try to get it from localStorage
      if (!studentIdToUse) {
        studentIdToUse = localStorage.getItem('userLoginId');
      }
      
      // If still empty, use fallback for testing
      if (!studentIdToUse) {
        studentIdToUse = '123456'; // Fallback ID for testing
      }
      
      console.log('Fetching submissions for student:', studentIdToUse);
      
      // Get the base API URL from the environment
      const baseApiUrl = process.env.REACT_APP_APILINK || API_URL;
      
      try {
        // Try the correct endpoint format first
        const submissionUrl = `${baseApiUrl}/quizSubmission/getSubmissionsByStudent/${studentIdToUse}`;
        console.log('Submission API URL:', submissionUrl);
        const response = await axios.get(submissionUrl);
        
        console.log('Submission response:', response.data);
        if (response.data.submissions) {
          console.log(`Found ${response.data.submissions.length} submissions`);
          setSubmissions(response.data.submissions);
        } else {
          console.log('No submissions found in primary response');
          setSubmissions([]);
        }
      } catch (primaryError) {
        console.error('Primary submission fetch failed:', primaryError);
        
        // Try the legacy API format as a fallback
        try {
          const legacyUrl = `${API_URL}/api/quizSubmission/getSubmissionsByStudent/${studentIdToUse}`;
          console.log('Trying legacy submission URL:', legacyUrl);
          const fallbackResponse = await axios.get(legacyUrl);
          
          console.log('Legacy submission response:', fallbackResponse.data);
          setSubmissions(fallbackResponse.data.submissions || []);
        } catch (fallbackError) {
          console.error('Fallback submission fetch failed:', fallbackError);
          setSubmissions([]);
        }
      }
    } catch (error) {
      console.error('Error in main submission fetching process:', error);
      setSubmissions([]);
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/student/quiz-attempt/${quizId}`);
  };

  const handleViewResult = (submissionId) => {
    navigate(`/student/quiz-result/${submissionId}`);
  };

  const getSubmissionForQuiz = (quizId) => {
    if (!quizId) {
      console.log('Invalid quiz ID provided');
      return null;
    }
    
    console.log('Looking for submission for quiz:', quizId);
    
    if (!submissions || submissions.length === 0) {
      console.log('No submissions available');
      return null;
    }
    
    console.log(`Checking ${submissions.length} submissions for quiz ID ${quizId}`);
    
    // Log all submissions for debugging
    submissions.forEach((sub, index) => {
      console.log(`Submission ${index + 1}:`, {
        id: sub._id,
        quizId: sub.quizId,
        status: sub.status,
        quizDetails: sub.quizDetails ? sub.quizDetails._id : 'No quiz details'
      });
    });
    
    // First try to find by quizDetails._id
    const byQuizDetails = submissions.find(sub => 
      sub.quizDetails && sub.quizDetails._id && 
      sub.quizDetails._id.toString() === quizId.toString()
    );
    if (byQuizDetails) {
      console.log('Found submission by quizDetails._id:', byQuizDetails);
      return byQuizDetails;
    }
    
    // If not found, try by quizId property (exact match)
    const byQuizId = submissions.find(sub => 
      sub.quizId && sub.quizId.toString() === quizId.toString()
    );
    if (byQuizId) {
      console.log('Found submission by quizId match:', byQuizId);
      return byQuizId;
    }
    
    console.log('No submission found for quiz ID:', quizId);
    return null;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isQuizOverdue = (dueDate) => {
    return new Date() > new Date(dueDate);
  };

  const calculateScore = (submission) => {
    if (!submission || !submission.quizDetails) return '0%';
    
    const percentage = (submission.totalMarksObtained / submission.quizDetails.totalMarks) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">My Quizzes</h4>
              <Badge bg="light" text="dark" pill>
                {quizzes.length} {quizzes.length === 1 ? 'Quiz' : 'Quizzes'}
              </Badge>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading quizzes...</p>
                </div>
              ) : quizzes.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {quizzes.map((quiz, index) => {
                    const submission = getSubmissionForQuiz(quiz._id);
                    const isCompleted = submission && (submission.status === 'Completed' || submission.status === 'Evaluated');
                    const isInProgress = submission && submission.status === 'In Progress';
                    const isOverdue = isQuizOverdue(quiz.dueDate);
                    
                    // Determine card styling based on status
                    let cardBorderClass = '';
                    let statusBadge = null;
                    
                    if (isCompleted) {
                      cardBorderClass = 'border-success';
                      statusBadge = <Badge bg="success" pill>Completed</Badge>;
                    } else if (isInProgress) {
                      cardBorderClass = 'border-warning';
                      statusBadge = <Badge bg="warning" text="dark" pill>In Progress</Badge>;
                    } else if (isOverdue) {
                      cardBorderClass = 'border-danger';
                      statusBadge = <Badge bg="danger" pill>Overdue</Badge>;
                    } else {
                      cardBorderClass = 'border-info';
                      statusBadge = <Badge bg="info" pill>Not Attempted</Badge>;
                    }
                    
                    return (
                      <Col key={quiz._id}>
                        <Card className={`h-100 shadow-sm ${cardBorderClass}`}>
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <div className="text-truncate" style={{ maxWidth: '70%' }} title={quiz.title}>
                              <strong>{quiz.title}</strong>
                            </div>
                            {statusBadge}
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-3">
                              <small className="text-muted">Subject:</small>
                              <div><Badge bg="secondary">{quiz.subject}</Badge></div>
                            </div>
                            
                            <div className="d-flex justify-content-between mb-3">
                              <div>
                                <small className="text-muted">Duration:</small>
                                <div>{quiz.duration} minutes</div>
                              </div>
                              <div>
                                <small className="text-muted">Total Marks:</small>
                                <div>{quiz.totalMarks}</div>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <small className="text-muted">Due Date:</small>
                              <div className="d-flex align-items-center">
                                {formatDate(quiz.dueDate)}
                                {isOverdue && !isCompleted && (
                                  <Badge bg="danger" className="ms-2" pill>Overdue</Badge>
                                )}
                              </div>
                            </div>
                            
                            {isCompleted && (
                              <div className="mb-3">
                                <small className="text-muted">Your Score:</small>
                                <div className="d-flex align-items-center">
                                  <div className="progress flex-grow-1 me-2" style={{ height: '10px' }}>
                                    <div 
                                      className="progress-bar bg-success" 
                                      role="progressbar" 
                                      style={{ width: `${parseFloat(calculateScore(submission))}%` }}
                                      aria-valuenow={parseFloat(calculateScore(submission))}
                                      aria-valuemin="0" 
                                      aria-valuemax="100"
                                    ></div>
                                  </div>
                                  <strong>{calculateScore(submission)}</strong>
                                </div>
                              </div>
                            )}
                          </Card.Body>
                          <Card.Footer className="bg-transparent">
                            <div className="d-grid">
                              {isCompleted ? (
                                <Button 
                                  variant="outline-success" 
                                  onClick={() => handleViewResult(submission._id)}
                                >
                                  View Result
                                </Button>
                              ) : isInProgress ? (
                                <Button 
                                  variant="warning"
                                  onClick={() => handleStartQuiz(quiz._id)}
                                >
                                  Continue Quiz
                                </Button>
                              ) : isOverdue ? (
                                <Button variant="outline-secondary" disabled>
                                  Expired
                                </Button>
                              ) : (
                                <Button 
                                  variant="primary"
                                  onClick={() => handleStartQuiz(quiz._id)}
                                  data-quiz-id={quiz._id}
                                >
                                  Start Quiz
                                </Button>
                              )}
                            </div>
                          </Card.Footer>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <div className="text-center py-5">
                  <h5>No Quizzes Available</h5>
                  <p className="text-muted">There are no quizzes assigned to you at this time.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QuizList;
