import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';

const QuizSubmissions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { userData, userLoginId } = useSelector((state) => state);
  
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('completed');

  // Fetch quiz, submissions, and students on component mount
  useEffect(() => {
    fetchQuiz();
    fetchSubmissions();
    fetchStats();
  }, [quizId]);

  // Fetch students when quiz data is available
  useEffect(() => {
    if (quiz) {
      fetchStudents();
    }
  }, [quiz]);

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

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/quizSubmission/getSubmissionsByQuiz/${quizId}`);
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
      const response = await axios.get(`${API_URL}/api/quiz/getQuizStats/${quizId}`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      // Fetch students based on branch and semester from quiz
      const response = await axios.post(`${API_URL}/api/student/details/getStudentsByClass`, {
        branch: quiz.branch,
        semester: quiz.semester
      });
      setStudents(response.data.Student || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleViewResult = (submissionId) => {
    navigate(`/faculty/quiz-result/${submissionId}`);
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
    
    const submittedStudentIds = submissions
      .filter(sub => sub.status === 'Completed' || sub.status === 'Evaluated')
      .map(sub => sub.studentId);
    
    return students.filter(student => !submittedStudentIds.includes(student.enrollmentNo));
  };

  const getInProgressStudents = () => {
    if (!students || !submissions) return [];
    
    const inProgressSubmissions = submissions.filter(sub => sub.status === 'In Progress');
    
    return inProgressSubmissions.map(sub => {
      const student = students.find(s => s.enrollmentNo === sub.studentId);
      return {
        ...sub,
        studentName: student ? `${student.firstName} ${student.lastName}` : sub.studentId
      };
    });
  };

  const calculateScore = (submission) => {
    if (!submission || !quiz) return '0%';
    
    const percentage = (submission.totalMarksObtained / quiz.totalMarks) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 70) return 'bg-emerald-100 text-emerald-800';
    if (percentage >= 40) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const renderCompletedSubmissionsTable = () => {
    const completedSubmissions = submissions.filter(
      sub => sub.status === 'Completed' || sub.status === 'Evaluated'
    );
    
    return (
      loading ? (
        <div className="flex justify-center items-center p-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">#</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Start Time</th>
                <th className="px-6 py-4">End Time</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {completedSubmissions.length > 0 ? (
                completedSubmissions.map((submission, index) => {
                  const scorePercentage = (submission.totalMarksObtained / quiz?.totalMarks) * 100;
                  return (
                    <tr key={submission._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium">{getStudentName(submission.studentId)}</td>
                      <td className="px-6 py-4">{formatDate(submission.startTime)}</td>
                      <td className="px-6 py-4">{formatDate(submission.endTime)}</td>
                      <td className="px-6 py-4">
                        {Math.round((new Date(submission.endTime) - new Date(submission.startTime)) / 60000)} min
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getScoreColor(scorePercentage)}`}>
                          {submission.totalMarksObtained}/{quiz?.totalMarks} ({calculateScore(submission)})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm px-4 py-2 transition-colors"
                          onClick={() => handleViewResult(submission._id)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No completed submissions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )
    );
  };

  const renderInProgressTable = () => {
    const inProgressStudents = getInProgressStudents();
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-4 rounded-tl-lg">#</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Start Time</th>
              <th className="px-6 py-4">Time Elapsed</th>
              <th className="px-6 py-4 rounded-tr-lg">Questions Answered</th>
            </tr>
          </thead>
          <tbody>
            {inProgressStudents.length > 0 ? (
              inProgressStudents.map((submission, index) => (
                <tr key={submission._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{submission.studentName}</td>
                  <td className="px-6 py-4">{formatDate(submission.startTime)}</td>
                  <td className="px-6 py-4">
                    {Math.round((new Date() - new Date(submission.startTime)) / 60000)} min
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative h-2 bg-gray-200 rounded-full w-32">
                      <div 
                        className="absolute h-2 bg-indigo-600 rounded-full" 
                        style={{ width: `${(submission.answers.length / quiz?.questions.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {submission.answers.length}/{quiz?.questions.length}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No students currently taking the quiz</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderNotSubmittedTable = () => {
    const notSubmittedStudents = getNonSubmittedStudents();
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-4 rounded-tl-lg">#</th>
              <th className="px-6 py-4">Enrollment No</th>
              <th className="px-6 py-4 rounded-tr-lg">Student Name</th>
            </tr>
          </thead>
          <tbody>
            {notSubmittedStudents.length > 0 ? (
              notSubmittedStudents.map((student, index) => (
                <tr key={student._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{student.enrollmentNo}</td>
                  <td className="px-6 py-4 font-medium">{`${student.firstName} ${student.lastName}`}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">All students have submitted or started the quiz</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStatCard = (title, value, icon) => {
    return (
      <div className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-500 text-sm font-medium">{title}</div>
          <div className="text-indigo-600 bg-indigo-100 p-2 rounded-lg">
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button 
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
                onClick={() => navigate(-1)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Quizzes
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Quiz Submissions</h1>
            </div>
            {quiz && quiz.status === 'Published' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg className="mr-1.5 h-2 w-2 text-green-600" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
                Published
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Quiz Details */}
        {quiz && (
          <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">{quiz.title}</h2>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{quiz.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subject:</span>
                    <span className="font-medium text-gray-900">{quiz.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Branch:</span>
                    <span className="font-medium text-gray-900">{quiz.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Semester:</span>
                    <span className="font-medium text-gray-900">{quiz.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date:</span>
                    <span className="font-medium text-gray-900">{formatDate(quiz.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Marks:</span>
                    <span className="font-medium text-gray-900">{quiz.totalMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium text-gray-900">{quiz.duration} minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {renderStatCard("Total Submissions", stats.totalSubmissions, (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ))}
            
            {renderStatCard("Completed", stats.completedCount, (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ))}
            
            {renderStatCard("In Progress", stats.inProgressCount, (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ))}
            
            {renderStatCard("Average Score", stats.averageScore ? `${stats.averageScore.toFixed(1)}%` : '0%', (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            ))}
          </div>
        )}
        
        {/* Tabs */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'completed' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'in-progress' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('in-progress')}
              >
                In Progress
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'not-submitted' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('not-submitted')}
              >
                Not Submitted
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'completed' && renderCompletedSubmissionsTable()}
            {activeTab === 'in-progress' && renderInProgressTable()}
            {activeTab === 'not-submitted' && renderNotSubmittedTable()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSubmissions;