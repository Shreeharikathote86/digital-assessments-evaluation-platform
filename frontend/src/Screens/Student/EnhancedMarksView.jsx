import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Tabs, Tab, Badge, ProgressBar } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import { baseApiURL } from "../../baseUrl";
import Heading from "../../components/Heading";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale } from 'chart.js';
import { Pie, Bar, PolarArea } from 'react-chartjs-2';
import { FaGraduationCap, FaClipboardCheck, FaQuestionCircle } from 'react-icons/fa';
import { BsFileEarmarkCheck, BsAward, BsCalendarCheck } from 'react-icons/bs';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale);

const EnhancedMarksView = () => {
  const userData = useSelector((state) => state.userData);
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    // Get student ID from multiple sources
    const getStudentId = () => {
      // Try to get from Redux state
      if (userData && userData.enrollmentNo) {
        console.log('Got student ID from Redux:', userData.enrollmentNo);
        return userData.enrollmentNo;
      }
      
      // Try to get from localStorage
      const localStorageId = localStorage.getItem('userLoginId');
      if (localStorageId) {
        console.log('Got student ID from localStorage:', localStorageId);
        return localStorageId;
      }
      
      // Fallback ID for testing
      console.log('Using fallback student ID: 123456');
      return '123456';
    };
    
    const id = getStudentId();
    setStudentId(id);
    
    // Fetch marks data
    fetchMarks(id);
  }, [userData]);

  const fetchMarks = async (enrollmentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const enrollmentNo = enrollmentId || studentId;
      console.log('Fetching marks with enrollment number:', enrollmentNo);
      
      if (!enrollmentNo) {
        console.error('No enrollment number found');
        setError('No enrollment number found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Use the provided enrollment number
      const studentIdToUse = enrollmentNo.toString();
      
      // Initialize processed marks object
      let processedMarks = {
        enrollmentNo: studentIdToUse,
        isa1: {},
        isa2: {},
        esa: {},
        assignments: [],
        quizzes: []
      };
      
      // Fetch regular marks (ISA1, ISA2, ESA)
      let regularMarksSuccess = false;
      try {
        // Ensure enrollment number is sent as a string
        const regularResponse = await axios.post(`${baseApiURL()}/marks/getMarks`, {
          enrollmentNo: studentIdToUse
        });
        
        console.log('Regular marks response:', regularResponse.data);
        
        if (regularResponse.data.success) {
          regularMarksSuccess = true;
          const regularMarks = regularResponse.data.marks;
          console.log('Marks data received:', regularMarks);
          
          // Update the processed marks with exam data
          processedMarks = {
            ...processedMarks,
            enrollmentNo: regularMarks.enrollmentNo,
            isa1: regularMarks.isa1 || {},
            isa2: regularMarks.isa2 || {},
            esa: regularMarks.esa || {}
          };
        }
      } catch (err) {
        console.error('Regular marks fetch error:', err);
      }
      
      // Fetch assignment submissions for this student
      try {
        console.log('Fetching assignment submissions for student:', studentIdToUse);
        // Use the correct API endpoint path for submissions
        const assignmentApiUrl = `${baseApiURL()}/submission/getSubmissionsByStudent/${studentIdToUse}`;
        console.log('Assignment API URL:', assignmentApiUrl);
        const assignmentResponse = await axios.get(assignmentApiUrl);
        console.log('Assignment submissions response:', assignmentResponse.data);
        
        if (assignmentResponse.data.success && assignmentResponse.data.submissions) {
          // Filter only evaluated assignments
          const evaluatedAssignments = assignmentResponse.data.submissions
            .filter(submission => submission.status === 'Evaluated' && submission.marks !== null)
            .map(submission => ({
              assignmentId: submission.assignmentId,
              title: submission.assignmentDetails?.title || 'Assignment',
              subject: submission.assignmentDetails?.subject || 'Unknown',
              marks: submission.marks,
              totalMarks: submission.assignmentDetails?.totalMarks || 100,
              submittedAt: submission.submissionDate
            }));
          
          processedMarks.assignments = evaluatedAssignments;
          console.log('Processed assignment data:', evaluatedAssignments);
        }
      } catch (err) {
        console.error('Assignment fetch error:', err);
      }
      
      // Fetch quiz submissions for this student
      try {
        console.log('Fetching quiz submissions for student:', studentIdToUse);
        // Use the correct API endpoint path for quiz submissions
        const quizApiUrl = `${baseApiURL()}/quizSubmission/getSubmissionsByStudent/${studentIdToUse}`;
        console.log('Quiz API URL:', quizApiUrl);
        const quizResponse = await axios.get(quizApiUrl);
        console.log('Quiz submissions response:', quizResponse.data);
        
        if (quizResponse.data.success && quizResponse.data.submissions) {
          // Filter only completed quizzes
          const completedQuizzes = quizResponse.data.submissions
            .filter(submission => submission.status === 'Completed' || submission.status === 'Evaluated')
            .map(submission => ({
              quizId: submission.quizId,
              title: submission.quizDetails?.title || 'Quiz',
              subject: submission.quizDetails?.subject || 'Unknown',
              marks: submission.totalMarksObtained,
              totalMarks: submission.quizDetails?.totalMarks || 100,
              submittedAt: submission.endTime || submission.createdAt
            }));
          
          processedMarks.quizzes = completedQuizzes;
          console.log('Processed quiz data:', completedQuizzes);
        }
      } catch (err) {
        console.error('Quiz fetch error:', err);
      }
      
      console.log('Final processed marks data:', processedMarks);
      
      // Check if there's no marks data and no assignments/quizzes
      if (Object.keys(processedMarks.isa1).length === 0 && 
          Object.keys(processedMarks.isa2).length === 0 && 
          Object.keys(processedMarks.esa).length === 0 &&
          processedMarks.assignments.length === 0 &&
          processedMarks.quizzes.length === 0) {
        console.log('No marks data found');
        setError('No marks data available for this student.');
        setLoading(false);
        return;
      }
      
      // Set the marks data and finish loading
      setMarksData(processedMarks);
      setLoading(false);
      
    } catch (error) {
      console.error('Error in fetchMarks function:', error);
      setError('Error fetching marks data. Please try again later.');
      setLoading(false);
    }
  };

  // Prepare chart data for assignments
  const prepareAssignmentChartData = () => {
    if (!marksData || !marksData.assignments || marksData.assignments.length === 0) {
      return null;
    }

    const labels = marksData.assignments.map(a => a.title);
    const obtainedMarks = marksData.assignments.map(a => a.marks);
    const totalMarks = marksData.assignments.map(a => a.totalMarks);

    return {
      labels,
      datasets: [
        {
          label: 'Obtained Marks',
          data: obtainedMarks,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Marks',
          data: totalMarks,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  // Prepare chart data for quizzes
  const prepareQuizChartData = () => {
    if (!marksData || !marksData.quizzes || marksData.quizzes.length === 0) {
      return null;
    }

    const labels = marksData.quizzes.map(q => q.title);
    const obtainedMarks = marksData.quizzes.map(q => q.marks);
    const totalMarks = marksData.quizzes.map(q => q.totalMarks);

    return {
      labels,
      datasets: [
        {
          label: 'Obtained Marks',
          data: obtainedMarks,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Marks',
          data: totalMarks,
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  // Prepare chart data for exams (ISA1, ISA2, ESA)
  const prepareExamChartData = () => {
    if (!marksData) {
      return null;
    }

    // Only use ISA1, ISA2, ESA exam types
    const examTypes = ['isa1', 'isa2', 'esa'];
    const examLabels = ['ISA 1', 'ISA 2', 'ESA'];
    const subjects = [];
    const datasets = [];

    // Collect all unique subjects across exam types
    examTypes.forEach(type => {
      if (marksData[type]) {
        Object.keys(marksData[type]).forEach(subject => {
          if (!subjects.includes(subject)) {
            subjects.push(subject);
          }
        });
      }
    });

    // Create datasets for each exam type
    examTypes.forEach((type, index) => {
      if (!marksData[type] || Object.keys(marksData[type]).length === 0) {
        return; // Skip empty exam types
      }
      
      const data = subjects.map(subject => {
        if (marksData[type] && marksData[type][subject]) {
          // Convert to number if it's a string
          const mark = marksData[type][subject];
          return typeof mark === 'string' ? parseFloat(mark) : mark;
        }
        return 0;
      });

      // Only add non-empty datasets
      if (data.some(val => val > 0)) {
        datasets.push({
          label: examLabels[index],
          data,
          backgroundColor: `rgba(${index * 100}, ${255 - index * 50}, ${index * 70}, 0.6)`,
          borderColor: `rgba(${index * 100}, ${255 - index * 50}, ${index * 70}, 1)`,
          borderWidth: 1,
        });
      }
    });

    return {
      labels: subjects,
      datasets
    };
  };

  // Prepare overall performance pie chart
  const prepareOverallPerformanceChart = () => {
    if (!marksData) {
      return null;
    }

    let assignmentTotal = 0;
    let assignmentObtained = 0;
    let quizTotal = 0;
    let quizObtained = 0;
    let isa1Total = 0;
    let isa1Obtained = 0;
    let isa2Total = 0;
    let isa2Obtained = 0;
    let esaTotal = 0;
    let esaObtained = 0;

    // Calculate assignment totals
    if (marksData.assignments && marksData.assignments.length > 0) {
      marksData.assignments.forEach(a => {
        const totalMarks = parseFloat(a.totalMarks) || 0;
        const marks = parseFloat(a.marks) || 0;
        
        // Ensure marks don't exceed total marks
        const validMarks = Math.min(marks, totalMarks);
        
        assignmentTotal += totalMarks;
        assignmentObtained += validMarks;
      });
    }

    // Calculate quiz totals
    if (marksData.quizzes && marksData.quizzes.length > 0) {
      marksData.quizzes.forEach(q => {
        const totalMarks = parseFloat(q.totalMarks) || 0;
        const marks = parseFloat(q.marks) || 0;
        
        // Ensure marks don't exceed total marks
        const validMarks = Math.min(marks, totalMarks);
        
        quizTotal += totalMarks;
        quizObtained += validMarks;
      });
    }

    // Calculate ISA1 totals (30 marks per subject)
    if (marksData.isa1) {
      Object.keys(marksData.isa1).forEach(subject => {
        const mark = typeof marksData.isa1[subject] === 'string' 
          ? parseFloat(marksData.isa1[subject]) || 0
          : marksData.isa1[subject] || 0;
        
        // Ensure mark doesn't exceed maximum (30)
        const validMark = Math.min(mark, 30);
        
        isa1Total += 30;
        isa1Obtained += validMark;
      });
    }

    // Calculate ISA2 totals (30 marks per subject)
    if (marksData.isa2) {
      Object.keys(marksData.isa2).forEach(subject => {
        const mark = typeof marksData.isa2[subject] === 'string' 
          ? parseFloat(marksData.isa2[subject]) || 0
          : marksData.isa2[subject] || 0;
        
        // Ensure mark doesn't exceed maximum (30)
        const validMark = Math.min(mark, 30);
        
        isa2Total += 30;
        isa2Obtained += validMark;
      });
    }

    // Calculate ESA totals (60 marks per subject)
    if (marksData.esa) {
      Object.keys(marksData.esa).forEach(subject => {
        const mark = typeof marksData.esa[subject] === 'string' 
          ? parseFloat(marksData.esa[subject]) || 0
          : marksData.esa[subject] || 0;
        
        // Ensure mark doesn't exceed maximum (60)
        const validMark = Math.min(mark, 60);
        
        esaTotal += 60;
        esaObtained += validMark;
      });
    }

    return {
      labels: ['Assignments', 'Quizzes', 'ISA 1', 'ISA 2', 'ESA'],
      datasets: [
        {
          label: 'Performance (%)',
          data: [
            assignmentTotal > 0 ? Math.min((assignmentObtained / assignmentTotal) * 100, 100) : 0,
            quizTotal > 0 ? Math.min((quizObtained / quizTotal) * 100, 100) : 0,
            isa1Total > 0 ? Math.min((isa1Obtained / isa1Total) * 100, 100) : 0,
            isa2Total > 0 ? Math.min((isa2Obtained / isa2Total) * 100, 100) : 0,
            esaTotal > 0 ? Math.min((esaObtained / esaTotal) * 100, 100) : 0
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Helper function for chart tooltips
  const label = function(context) {
    return `${context.label}: ${context.raw.toFixed(1)}%`;
  };

  // Calculate overall performance percentage
  const calculateOverallPercentage = () => {
    if (!marksData) return 0;
    
    let totalObtainedMarks = 0;
    let totalMaxMarks = 0;
    
    // Calculate ISA1 marks
    if (marksData.isa1 && Object.keys(marksData.isa1).length > 0) {
      Object.keys(marksData.isa1).forEach(subject => {
        const mark = typeof marksData.isa1[subject] === 'string' 
          ? parseFloat(marksData.isa1[subject]) || 0
          : marksData.isa1[subject] || 0;
        
        // Ensure mark doesn't exceed maximum (30)
        const validMark = Math.min(mark, 30);
        totalObtainedMarks += validMark;
        totalMaxMarks += 30; // Max marks for ISA1
      });
    }
    
    // Calculate ISA2 marks
    if (marksData.isa2 && Object.keys(marksData.isa2).length > 0) {
      Object.keys(marksData.isa2).forEach(subject => {
        const mark = typeof marksData.isa2[subject] === 'string' 
          ? parseFloat(marksData.isa2[subject]) || 0
          : marksData.isa2[subject] || 0;
        
        // Ensure mark doesn't exceed maximum (30)
        const validMark = Math.min(mark, 30);
        totalObtainedMarks += validMark;
        totalMaxMarks += 30; // Max marks for ISA2
      });
    }
    
    // Calculate ESA marks
    if (marksData.esa && Object.keys(marksData.esa).length > 0) {
      Object.keys(marksData.esa).forEach(subject => {
        const mark = typeof marksData.esa[subject] === 'string' 
          ? parseFloat(marksData.esa[subject]) || 0
          : marksData.esa[subject] || 0;
        
        // Ensure mark doesn't exceed maximum (60)
        const validMark = Math.min(mark, 60);
        totalObtainedMarks += validMark;
        totalMaxMarks += 60; // Max marks for ESA
      });
    }
    
    // Calculate assignment marks
    if (marksData.assignments && marksData.assignments.length > 0) {
      marksData.assignments.forEach(assignment => {
        const marks = parseFloat(assignment.marks) || 0;
        const maxMarks = parseFloat(assignment.totalMarks) || 1; // Avoid division by zero
        
        // Ensure marks don't exceed total marks
        const validMarks = Math.min(marks, maxMarks);
        totalObtainedMarks += validMarks;
        totalMaxMarks += maxMarks;
      });
    }
    
    // Calculate quiz marks
    if (marksData.quizzes && marksData.quizzes.length > 0) {
      marksData.quizzes.forEach(quiz => {
        const marks = parseFloat(quiz.marks) || 0;
        const maxMarks = parseFloat(quiz.totalMarks) || 1; // Avoid division by zero
        
        // Ensure marks don't exceed total marks
        const validMarks = Math.min(marks, maxMarks);
        totalObtainedMarks += validMarks;
        totalMaxMarks += maxMarks;
      });
    }
    
    if (totalMaxMarks === 0) return 0;
    // Ensure percentage is never more than 100%
    const percentage = Math.min((totalObtainedMarks / totalMaxMarks) * 100, 100);
    return percentage.toFixed(1);
  };

  // Get color based on overall performance
  const getOverallPerformanceColor = () => {
    const percentage = parseFloat(calculateOverallPercentage());
    if (percentage < 40) return 'danger';
    if (percentage < 70) return 'warning';
    return 'success';
  };

  // Calculate exam type percentage (ISA1, ISA2, ESA)
  const calculateExamTypePercentage = (examType) => {
    if (!marksData || !marksData[examType] || Object.keys(marksData[examType]).length === 0) return 0;
    
    let totalObtainedMarks = 0;
    let totalMaxMarks = 0;
    const maxMarksPerExam = examType === 'esa' ? 60 : 30;
    
    Object.keys(marksData[examType]).forEach(subject => {
      const mark = typeof marksData[examType][subject] === 'string' 
        ? parseFloat(marksData[examType][subject]) || 0
        : marksData[examType][subject] || 0;
      
      // Ensure mark doesn't exceed maximum
      const validMark = Math.min(mark, maxMarksPerExam);
      totalObtainedMarks += validMark;
      totalMaxMarks += maxMarksPerExam;
    });
    
    if (totalMaxMarks === 0) return 0;
    // Ensure percentage is never more than 100%
    const percentage = Math.min((totalObtainedMarks / totalMaxMarks) * 100, 100);
    return percentage.toFixed(1);
  };

  // Get color based on exam type performance
  const getExamTypePerformanceColor = (examType) => {
    const percentage = parseFloat(calculateExamTypePercentage(examType));
    if (percentage < 40) return 'danger';
    if (percentage < 70) return 'warning';
    return 'success';
  };

  // Calculate assignment percentage
  const calculateAssignmentPercentage = () => {
    if (!marksData || !marksData.assignments || marksData.assignments.length === 0) return 0;
    
    let totalObtainedMarks = 0;
    let totalMaxMarks = 0;
    
    marksData.assignments.forEach(assignment => {
      const marks = parseFloat(assignment.marks) || 0;
      const maxMarks = parseFloat(assignment.totalMarks) || 1; // Avoid division by zero
      
      // Ensure marks don't exceed total marks
      const validMarks = Math.min(marks, maxMarks);
      totalObtainedMarks += validMarks;
      totalMaxMarks += maxMarks;
    });
    
    if (totalMaxMarks === 0) return 0;
    // Ensure percentage is never more than 100%
    const percentage = Math.min((totalObtainedMarks / totalMaxMarks) * 100, 100);
    return percentage.toFixed(1);
  };

  // Get color based on assignment performance
  const getAssignmentPerformanceColor = () => {
    const percentage = parseFloat(calculateAssignmentPercentage());
    if (percentage < 40) return 'danger';
    if (percentage < 70) return 'warning';
    return 'success';
  };

  // Calculate quiz percentage
  const calculateQuizPercentage = () => {
    if (!marksData || !marksData.quizzes || marksData.quizzes.length === 0) return 0;
    
    let totalObtainedMarks = 0;
    let totalMaxMarks = 0;
    
    marksData.quizzes.forEach(quiz => {
      const marks = parseFloat(quiz.marks) || 0;
      const maxMarks = parseFloat(quiz.totalMarks) || 1; // Avoid division by zero
      
      // Ensure marks don't exceed total marks
      const validMarks = Math.min(marks, maxMarks);
      totalObtainedMarks += validMarks;
      totalMaxMarks += maxMarks;
    });
    
    if (totalMaxMarks === 0) return 0;
    // Ensure percentage is never more than 100%
    const percentage = Math.min((totalObtainedMarks / totalMaxMarks) * 100, 100);
    return percentage.toFixed(1);
  };

  // Get color based on quiz performance
  const getQuizPerformanceColor = () => {
    const percentage = parseFloat(calculateQuizPercentage());
    if (percentage < 40) return 'danger';
    if (percentage < 70) return 'warning';
    return 'success';
  };

  // Combine assignment and quiz data for the polar area chart
  const combineAssignmentAndQuizChartData = () => {
    return {
      labels: ['Assignments', 'Quizzes', 'ISA1', 'ISA2', 'ESA'],
      datasets: [
        {
          label: 'Performance (%)',
          data: [
            calculateAssignmentPercentage(),
            calculateQuizPercentage(),
            calculateExamTypePercentage('isa1'),
            calculateExamTypePercentage('isa2'),
            calculateExamTypePercentage('esa')
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  // Get recent activity from all assessment types
  const getRecentActivity = () => {
    if (!marksData) return [];
    
    const activities = [];
    
    // Add assignments
    if (marksData.assignments && marksData.assignments.length > 0) {
      marksData.assignments.forEach(assignment => {
        activities.push({
          type: 'Assignment',
          subject: assignment.subject,
          title: assignment.title,
          score: assignment.marks,
          outOf: assignment.totalMarks,
          date: assignment.submittedOn || assignment.submittedAt
        });
      });
    }
    
    // Add quizzes
    if (marksData.quizzes && marksData.quizzes.length > 0) {
      marksData.quizzes.forEach(quiz => {
        activities.push({
          type: 'Quiz',
          subject: quiz.subject,
          title: quiz.title,
          score: quiz.marks,
          outOf: quiz.totalMarks,
          date: quiz.attemptedOn || quiz.submittedAt
        });
      });
    }
    
    // Add ISA1 marks
    if (marksData.isa1 && Object.keys(marksData.isa1).length > 0) {
      Object.keys(marksData.isa1).forEach(subject => {
        activities.push({
          type: 'ISA1',
          subject: subject,
          title: 'Internal Assessment 1',
          score: marksData.isa1[subject],
          outOf: 30,
          date: new Date() // Since we don't have the date, use current date
        });
      });
    }
    
    // Add ISA2 marks
    if (marksData.isa2 && Object.keys(marksData.isa2).length > 0) {
      Object.keys(marksData.isa2).forEach(subject => {
        activities.push({
          type: 'ISA2',
          subject: subject,
          title: 'Internal Assessment 2',
          score: marksData.isa2[subject],
          outOf: 30,
          date: new Date() // Since we don't have the date, use current date
        });
      });
    }
    
    // Add ESA marks
    if (marksData.esa && Object.keys(marksData.esa).length > 0) {
      Object.keys(marksData.esa).forEach(subject => {
        activities.push({
          type: 'ESA',
          subject: subject,
          title: 'End-Semester Assessment',
          score: marksData.esa[subject],
          outOf: 60,
          date: new Date() // Since we don't have the date, use current date
        });
      });
    }
    
    // Sort by date (most recent first) and limit to 5 items
    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your academic performance data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="shadow-sm border-0">
          <div className="d-flex align-items-center">
            <div className="me-3 fs-3">⚠️</div>
            <div>
              <h5 className="mb-1">Unable to Load Data</h5>
              <p className="mb-0">{error}</p>
            </div>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <Alert variant="danger" className="my-4">
          {error}
        </Alert>
      ) : (
        <Tabs defaultActiveKey="overview" id="marks-tabs" className="mb-3 flex flex-wrap">
          <Tab 
            eventKey="overview" 
            title={
              <span className="d-flex align-items-center">
                <FaGraduationCap className="me-2" />
                <span className="d-none d-sm-inline">Overview</span>
                <span className="d-inline d-sm-none">Overview</span>
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Overall Performance Card */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Card.Header className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3">
                  <h5 className="mb-0 font-bold flex items-center">
                    <FaGraduationCap className="mr-2" /> Overall Performance
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-[200px] mx-auto mb-4">
                      {marksData && (
                        <Pie 
                          data={prepareOverallPerformanceChart()} 
                          options={{
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  boxWidth: 12,
                                  padding: 15
                                }
                              },
                              tooltip: {
                                callbacks: {
                                  label: label
                                }
                              }
                            },
                            maintainAspectRatio: true
                          }}
                        />
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <h6 className="font-bold text-gray-700">Overall Score</h6>
                      <div className="flex justify-center items-center">
                        <Badge 
                          bg={getOverallPerformanceColor()} 
                          className="px-3 py-2 text-lg"
                        >
                          {calculateOverallPercentage()}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Exams Performance Card */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Card.Header className="bg-gradient-to-r from-purple-600 to-purple-400 text-white py-3">
                  <h5 className="mb-0 font-bold flex items-center">
                    <BsFileEarmarkCheck className="mr-2" /> Exam Performance
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-[200px] mx-auto mb-4">
                      {marksData && (
                        <Bar 
                          data={prepareExamChartData()} 
                          options={{
                            plugins: {
                              legend: {
                                display: false
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                  callback: function(value) {
                                    return value + '%';
                                  }
                                }
                              }
                            },
                            maintainAspectRatio: true
                          }}
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full mt-2">
                      <div className="text-center">
                        <h6 className="text-xs sm:text-sm font-semibold text-gray-700">ISA 1</h6>
                        <Badge bg={getExamTypePerformanceColor('isa1')} className="w-full">
                          {calculateExamTypePercentage('isa1')}%
                        </Badge>
                      </div>
                      <div className="text-center">
                        <h6 className="text-xs sm:text-sm font-semibold text-gray-700">ISA 2</h6>
                        <Badge bg={getExamTypePerformanceColor('isa2')} className="w-full">
                          {calculateExamTypePercentage('isa2')}%
                        </Badge>
                      </div>
                      <div className="text-center">
                        <h6 className="text-xs sm:text-sm font-semibold text-gray-700">ESA</h6>
                        <Badge bg={getExamTypePerformanceColor('esa')} className="w-full">
                          {calculateExamTypePercentage('esa')}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Assignments & Quizzes Card */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <Card.Header className="bg-gradient-to-r from-green-600 to-green-400 text-white py-3">
                  <h5 className="mb-0 font-bold flex items-center">
                    <BsAward className="mr-2" /> Assignments & Quizzes
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-[200px] mx-auto mb-4">
                      {marksData && (
                        <PolarArea 
                          data={combineAssignmentAndQuizChartData()} 
                          options={{
                            plugins: {
                              legend: {
                                position: 'bottom',
                                labels: {
                                  boxWidth: 12,
                                  padding: 10,
                                  font: {
                                    size: 11
                                  }
                                }
                              }
                            },
                            maintainAspectRatio: true
                          }}
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full mt-2">
                      <div className="text-center">
                        <h6 className="text-xs sm:text-sm font-semibold text-gray-700">Assignments</h6>
                        <Badge bg={getAssignmentPerformanceColor()} className="w-full">
                          {calculateAssignmentPercentage()}%
                        </Badge>
                      </div>
                      <div className="text-center">
                        <h6 className="text-xs sm:text-sm font-semibold text-gray-700">Quizzes</h6>
                        <Badge bg={getQuizPerformanceColor()} className="w-full">
                          {calculateQuizPercentage()}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-gradient-to-r from-gray-700 to-gray-600 text-white py-3">
                <h5 className="mb-0 font-bold flex items-center">
                  <BsCalendarCheck className="mr-2" /> Recent Activity
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="overflow-x-auto">
                  <Table hover responsive className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3">Date</th>
                        <th className="py-3">Type</th>
                        <th className="py-3">Subject</th>
                        <th className="py-3">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRecentActivity().map((activity, index) => (
                        <tr key={index}>
                          <td className="py-3">{formatDate(activity.date)}</td>
                          <td className="py-3">
                            <Badge 
                              bg={
                                activity.type === 'Assignment' ? 'primary' : 
                                activity.type === 'Quiz' ? 'info' : 
                                activity.type === 'ISA1' ? 'warning' :
                                activity.type === 'ISA2' ? 'secondary' : 'danger'
                              }
                              pill
                            >
                              {activity.type}
                            </Badge>
                          </td>
                          <td className="py-3">{activity.subject}</td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <div className="me-2 fw-bold">{activity.score}</div>
                              <small className="text-muted">/ {activity.outOf}</small>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {getRecentActivity().length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted">
                            No recent activity found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab>

          <Tab 
            eventKey="assignments" 
            title={
              <span className="d-flex align-items-center">
                <FaClipboardCheck className="me-2" />
                <span className="d-none d-sm-inline">Assignments</span>
                <span className="d-inline d-sm-none">Assignments</span>
              </span>
            }
          >
            <Card className="shadow-sm">
              <Card.Header className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3">
                <h5 className="mb-0 font-bold">Assignment Marks</h5>
              </Card.Header>
              <Card.Body>
                {marksData && marksData.assignments && marksData.assignments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table hover responsive>
                      <thead className="bg-light">
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Subject</th>
                          <th>Submitted On</th>
                          <th>Marks</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marksData.assignments.map((assignment, index) => {
                          // Ensure proper numeric conversion
                          const marks = parseFloat(assignment.marks) || 0;
                          const totalMarks = parseFloat(assignment.totalMarks) || 1; // Avoid division by zero
                          
                          // Ensure marks don't exceed total marks
                          const validMarks = Math.min(marks, totalMarks);
                          const percentage = (validMarks / totalMarks) * 100;
                          
                          let badgeVariant = 'success';
                          if (percentage < 40) badgeVariant = 'danger';
                          else if (percentage < 70) badgeVariant = 'warning';
                          
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                <div className="fw-bold">{assignment.title}</div>
                              </td>
                              <td>{assignment.subject}</td>
                              <td>{formatDate(assignment.submittedOn)}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2 fw-bold">{validMarks}</div>
                                  <small className="text-muted">/ {totalMarks}</small>
                                </div>
                              </td>
                              <td>
                                <Badge 
                                  bg={badgeVariant}
                                >
                                  {percentage.toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="text-muted mb-3">
                      <FaClipboardCheck size={48} />
                    </div>
                    <h5>No Assignment Marks Available</h5>
                    <p className="text-muted">You haven't submitted any assignments yet or they haven't been evaluated.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>

          <Tab 
            eventKey="quizzes" 
            title={
              <span className="d-flex align-items-center">
                <FaQuestionCircle className="me-2" />
                <span className="d-none d-sm-inline">Quizzes</span>
                <span className="d-inline d-sm-none">Quizzes</span>
              </span>
            }
          >
            <Card className="shadow-sm">
              <Card.Header className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3">
                <h5 className="mb-0 font-bold">Quiz Marks</h5>
              </Card.Header>
              <Card.Body>
                {marksData && marksData.quizzes && marksData.quizzes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table hover responsive>
                      <thead className="bg-light">
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Subject</th>
                          <th>Attempted On</th>
                          <th>Marks</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marksData.quizzes.map((quiz, index) => {
                          // Ensure proper numeric conversion
                          const marks = parseFloat(quiz.marks) || 0;
                          const totalMarks = parseFloat(quiz.totalMarks) || 1; // Avoid division by zero
                          
                          // Ensure marks don't exceed total marks
                          const validMarks = Math.min(marks, totalMarks);
                          const percentage = (validMarks / totalMarks) * 100;
                          
                          let badgeVariant = 'success';
                          if (percentage < 40) badgeVariant = 'danger';
                          else if (percentage < 70) badgeVariant = 'warning';
                          
                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                <div className="fw-bold">{quiz.title}</div>
                              </td>
                              <td>{quiz.subject}</td>
                              <td>{formatDate(quiz.submittedAt)}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2 fw-bold">{validMarks}</div>
                                  <small className="text-muted">/ {totalMarks}</small>
                                </div>
                              </td>
                              <td>
                                <Badge 
                                  bg={badgeVariant}
                                >
                                  {percentage.toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="text-muted mb-3">
                      <FaQuestionCircle size={48} />
                    </div>
                    <h5>No Quiz Marks Available</h5>
                    <p className="text-muted">You haven't attempted any quizzes yet.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>

          <Tab 
            eventKey="exams" 
            title={
              <span className="d-flex align-items-center">
                <FaGraduationCap className="me-2" />
                <span className="d-none d-sm-inline">Exam Marks</span>
                <span className="d-inline d-sm-none">Exams</span>
              </span>
            }
          >
            <Card className="shadow-sm">
              <Card.Header className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3">
                <h5 className="mb-0 font-bold">Exam Marks</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Tabs defaultActiveKey="isa1" id="exam-tabs" className="mb-3 px-3 pt-3">
                  <Tab 
                    eventKey="isa1" 
                    title={
                      <span className="d-flex align-items-center">
                        <Badge bg="primary" pill className="me-2">ISA1</Badge>
                        <span className="d-none d-sm-inline">Internal Assessment 1</span>
                        <span className="d-inline d-sm-none">ISA1</span>
                      </span>
                    }
                  >
                    {marksData && marksData.isa1 && Object.keys(marksData.isa1).length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table hover responsive className="align-middle">
                          <thead className="bg-light">
                            <tr>
                              <th>#</th>
                              <th>Subject</th>
                              <th>Marks</th>
                              <th>Performance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(marksData.isa1).map((subject, index) => {
                              // Convert to number if it's a string
                              const mark = marksData.isa1[subject];
                              const markValue = typeof mark === 'string' ? parseFloat(mark) : mark;
                              const percentage = (markValue / 30) * 100;
                              
                              let badgeVariant = 'success';
                              if (percentage < 40) badgeVariant = 'danger';
                              else if (percentage < 70) badgeVariant = 'warning';
                              
                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <div className="fw-bold">{subject}</div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div className="me-2 fw-bold">{markValue}</div>
                                      <small className="text-muted">/ 30</small>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div style={{ width: '100px' }} className="hidden sm:block">
                                        <ProgressBar 
                                          variant={badgeVariant}
                                          now={percentage} 
                                          style={{ height: '8px' }}
                                        />
                                      </div>
                                      <Badge 
                                        bg={badgeVariant} 
                                        className="ms-0 sm:ms-2"
                                      >
                                        {percentage.toFixed(1)}%
                                      </Badge>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <div className="text-muted mb-3">
                          <FaGraduationCap size={48} />
                        </div>
                        <h5>No ISA 1 Marks Available</h5>
                        <p className="text-muted">ISA 1 marks have not been uploaded yet.</p>
                      </div>
                    )}
                  </Tab>
                  <Tab 
                    eventKey="isa2" 
                    title={
                      <span className="d-flex align-items-center">
                        <Badge bg="secondary" pill className="me-2">ISA2</Badge>
                        <span className="d-none d-sm-inline">Internal Assessment 2</span>
                        <span className="d-inline d-sm-none">ISA2</span>
                      </span>
                    }
                  >
                    {marksData && marksData.isa2 && Object.keys(marksData.isa2).length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table hover responsive className="align-middle">
                          <thead className="bg-light">
                            <tr>
                              <th>#</th>
                              <th>Subject</th>
                              <th>Marks</th>
                              <th>Performance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(marksData.isa2).map((subject, index) => {
                              // Convert to number if it's a string
                              const mark = marksData.isa2[subject];
                              const markValue = typeof mark === 'string' ? parseFloat(mark) : mark;
                              const percentage = (markValue / 30) * 100;
                              
                              let badgeVariant = 'success';
                              if (percentage < 40) badgeVariant = 'danger';
                              else if (percentage < 70) badgeVariant = 'warning';
                              
                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <div className="fw-bold">{subject}</div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div className="me-2 fw-bold">{markValue}</div>
                                      <small className="text-muted">/ 30</small>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div style={{ width: '100px' }} className="hidden sm:block">
                                        <ProgressBar 
                                          variant={badgeVariant}
                                          now={percentage} 
                                          style={{ height: '8px' }}
                                        />
                                      </div>
                                      <Badge 
                                        bg={badgeVariant} 
                                        className="ms-0 sm:ms-2"
                                      >
                                        {percentage.toFixed(1)}%
                                      </Badge>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <div className="text-muted mb-3">
                          <FaGraduationCap size={48} />
                        </div>
                        <h5>No ISA 2 Marks Available</h5>
                        <p className="text-muted">ISA 2 marks have not been uploaded yet.</p>
                      </div>
                    )}
                  </Tab>
                  <Tab 
                    eventKey="esa" 
                    title={
                      <span className="d-flex align-items-center">
                        <Badge bg="danger" pill className="me-2">ESA</Badge>
                        <span className="d-none d-sm-inline">End-Semester Assessment</span>
                        <span className="d-inline d-sm-none">ESA</span>
                      </span>
                    }
                  >
                    {marksData && marksData.esa && Object.keys(marksData.esa).length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table hover responsive className="align-middle">
                          <thead className="bg-light">
                            <tr>
                              <th>#</th>
                              <th>Subject</th>
                              <th>Marks</th>
                              <th>Performance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(marksData.esa).map((subject, index) => {
                              // Convert to number if it's a string
                              const mark = marksData.esa[subject];
                              const markValue = typeof mark === 'string' ? parseFloat(mark) : mark;
                              const percentage = (markValue / 60) * 100;
                              
                              let badgeVariant = 'success';
                              if (percentage < 40) badgeVariant = 'danger';
                              else if (percentage < 70) badgeVariant = 'warning';
                              
                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <div className="fw-bold">{subject}</div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div className="me-2 fw-bold">{markValue}</div>
                                      <small className="text-muted">/ 60</small>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div style={{ width: '100px' }} className="hidden sm:block">
                                        <ProgressBar 
                                          variant={badgeVariant}
                                          now={percentage} 
                                          style={{ height: '8px' }}
                                        />
                                      </div>
                                      <Badge 
                                        bg={badgeVariant} 
                                        className="ms-0 sm:ms-2"
                                      >
                                        {percentage.toFixed(1)}%
                                      </Badge>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <div className="text-muted mb-3">
                          <FaGraduationCap size={48} />
                        </div>
                        <h5>No ESA Marks Available</h5>
                        <p className="text-muted">ESA marks have not been uploaded yet.</p>
                      </div>
                    )}
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      )}
    </div>
  );
};

export default EnhancedMarksView;
