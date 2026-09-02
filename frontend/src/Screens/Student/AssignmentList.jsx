import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';

const AssignmentList = () => {
  const { userData, userLoginId } = useSelector((state) => state);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch assignments and submissions on component mount
  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Direct approach - fetch all assignments first
      try {
        console.log('Fetching all assignments');
        const allAssignmentsResponse = await axios.post(`${API_URL}/api/assignment/getAssignments`, {});
        
        console.log('All assignments response:', allAssignmentsResponse.data);
        if (allAssignmentsResponse.data.assignments && allAssignmentsResponse.data.assignments.length > 0) {
          setAssignments(allAssignmentsResponse.data.assignments);
          setLoading(false);
          return; // Exit early if we successfully got assignments
        }
      } catch (directFetchError) {
        console.error('Error fetching all assignments:', directFetchError);
        // Continue to try the student-specific approach
      }
      
      // Try student-specific approach if the direct approach failed
      // Get student details to determine branch and semester
      try {
        // Get student ID from Redux or localStorage
        let studentIdToUse = userLoginId;
        
        // If userLoginId is empty, try to get it from localStorage
        if (!studentIdToUse) {
          studentIdToUse = localStorage.getItem('userLoginId');
          console.log('Retrieved studentId from localStorage for assignments:', studentIdToUse);
        }
        
        // If still empty, use fallback for testing
        if (!studentIdToUse) {
          studentIdToUse = '123456'; // Fallback ID for testing
          console.log('Using fallback student ID for assignments');
        }
        
        console.log('Fetching student details with ID:', studentIdToUse);
        const studentResponse = await axios.post(`${API_URL}/api/student/details/getDetails`, {
          enrollmentNo: studentIdToUse
        });
        
        console.log('Student API response:', studentResponse.data);
        
        // Different student data structures might be used
        const student = studentResponse.data.Student || 
                       studentResponse.data.user || 
                       (Array.isArray(studentResponse.data.user) ? studentResponse.data.user[0] : null);
        
        if (student) {
          console.log('Student details:', student);
          
          // Fetch assignments for student's branch and semester
          const response = await axios.post(`${API_URL}/api/assignment/getAssignments`, {
            branch: student.branch,
            semester: parseInt(student.semester) || student.semester
          });
          
          console.log('Fetched assignments response:', response.data);
          setAssignments(response.data.assignments || []);
        } else {
          console.error('No student details found in response');
          setError('Could not retrieve student details');
        }
      } catch (studentError) {
        console.error('Error fetching student details:', studentError);
        setError('Could not load student information');
        
        // Last resort - try to fetch all assignments without filters
        try {
          const fallbackResponse = await axios.post(`${API_URL}/api/assignment/getAssignments`, {});
          console.log('Fallback assignments response:', fallbackResponse.data);
          setAssignments(fallbackResponse.data.assignments || []);
        } catch (fallbackError) {
          console.error('Fallback assignments fetch failed:', fallbackError);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in main assignments fetching process:', error);
      setError('Failed to load assignments. Please try again later.');
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
        console.log('Retrieved studentId from localStorage for submissions:', studentIdToUse);
      }
      
      // If still empty, use fallback for testing
      if (!studentIdToUse) {
        studentIdToUse = '123456'; // Fallback ID for testing
        console.log('Using fallback student ID for submissions');
      }
      
      console.log('Fetching submissions for student:', studentIdToUse);
      const response = await axios.get(`${API_URL}/api/submission/getSubmissionsByStudent/${studentIdToUse}`);
      
      console.log('Submissions response:', response.data);
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubmitClick = (assignment) => {
    setCurrentAssignment(assignment);
    setSelectedFile(null);
    setUploadProgress(0);
    setShowSubmitModal(true);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    // Check file type
    const fileType = selectedFile.type;
    if (fileType !== 'application/pdf' && 
        fileType !== 'application/msword' && 
        fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setError('Only PDF and Word documents are allowed');
      return;
    }
    
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get student ID from Redux or localStorage
      let studentIdToUse = userLoginId;
      
      // If userLoginId is empty, try to get it from localStorage
      if (!studentIdToUse) {
        studentIdToUse = localStorage.getItem('userLoginId');
        console.log('Retrieved studentId from localStorage for submission:', studentIdToUse);
      }
      
      // If still empty, use fallback for testing
      if (!studentIdToUse) {
        studentIdToUse = '123456'; // Fallback ID for testing
        console.log('Using fallback student ID for submission');
      }
      
      console.log('Submitting assignment with student ID:', studentIdToUse);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('assignmentId', currentAssignment._id);
      formData.append('studentId', studentIdToUse);
      
      const response = await axios.post(
        `${API_URL}/api/submission/submitAssignment`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      setLoading(false);
      setShowSubmitModal(false);
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      
      // Extract detailed error message if available
      let errorMessage = 'Failed to submit assignment';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = `Failed to submit assignment: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Failed to submit assignment: ${error.message}`;
      }
      
      console.log('Assignment submission error details:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(sub => sub.assignmentDetails && sub.assignmentDetails._id === assignmentId);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isAssignmentOverdue = (dueDate) => {
    return new Date() > new Date(dueDate);
  };

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>Assignments</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {loading ? (
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
                      <th>Due Date</th>
                      <th>Total Marks</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.length > 0 ? (
                      assignments.map((assignment, index) => {
                        const submission = getSubmissionForAssignment(assignment._id);
                        return (
                          <tr key={assignment._id}>
                            <td>{index + 1}</td>
                            <td>{assignment.title}</td>
                            <td>{assignment.subject}</td>
                            <td>
                              {formatDate(assignment.dueDate)}
                              {isAssignmentOverdue(assignment.dueDate) && !submission && (
                                <Badge bg="danger" className="ms-2">Overdue</Badge>
                              )}
                            </td>
                            <td>{assignment.totalMarks}</td>
                            <td>
                              {submission ? (
                                <>
                                  <Badge bg={
                                    submission.status === 'Evaluated' ? 'success' :
                                    submission.status === 'Late' ? 'warning' : 'primary'
                                  }>
                                    {submission.status}
                                  </Badge>
                                  {submission.marks !== null && (
                                    <span className="ms-2">
                                      Score: {submission.marks}/{assignment.totalMarks}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <Badge bg="secondary">Not Submitted</Badge>
                              )}
                            </td>
                            <td>
                              {submission ? (
                                <div className="d-flex flex-column">
                                  <a 
                                    href={`${API_URL}${submission.fileUrl}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-primary mb-1"
                                  >
                                    View Submission
                                  </a>
                                  {!isAssignmentOverdue(assignment.dueDate) && (
                                    <Button 
                                      variant="outline-secondary" 
                                      size="sm"
                                      onClick={() => handleSubmitClick(assignment)}
                                    >
                                      Resubmit
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleSubmitClick(assignment)}
                                  disabled={isAssignmentOverdue(assignment.dueDate)}
                                >
                                  Submit
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">No assignments found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Submit Assignment Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentAssignment && (
            <>
              <p><strong>Title:</strong> {currentAssignment.title}</p>
              <p><strong>Subject:</strong> {currentAssignment.subject}</p>
              <p><strong>Due Date:</strong> {formatDate(currentAssignment.dueDate)}</p>
              <p><strong>Total Marks:</strong> {currentAssignment.totalMarks}</p>
              
              <Form onSubmit={handleSubmitAssignment}>
                <Form.Group className="mb-3">
                  <Form.Label>Upload File (PDF or Word document, max 10MB)</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    required
                  />
                  <Form.Text className="text-muted">
                    Only PDF and Word documents are allowed.
                  </Form.Text>
                </Form.Group>

                {uploadProgress > 0 && (
                  <div className="mb-3">
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${uploadProgress}%` }} 
                        aria-valuenow={uploadProgress} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      >
                        {uploadProgress}%
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end">
                  <Button variant="secondary" className="me-2" onClick={() => setShowSubmitModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading || !selectedFile}>
                    {loading ? 'Uploading...' : 'Submit Assignment'}
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

export default AssignmentList;
