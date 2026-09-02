import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { HiOutlineDocumentText, HiOutlineAcademicCap, HiOutlineQuestionMarkCircle } from 'react-icons/hi';

const QuizResult = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { userData, userLoginId } = useSelector((state) => state);
  
  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const getScoreColor = (percentage) => {
    if (percentage >= 70) return 'bg-green-600';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-500">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 flex items-start">
          <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0 text-red-500" />
          <p className="m-0">{error}</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>
      </div>
    );
  }

  if (!submissionData) {
    return null;
  }

  const { submission, result, detailedResults } = submissionData;
  const quiz = submission.quiz;
  const percentage = result.percentage || 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center px-4 py-2 mb-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
      >
        <FiArrowLeft className="mr-2" />
        Back
      </button>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full mb-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 rounded-t-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Quiz Result: {quiz.title}</h2>
          <p className="text-sm sm:text-base opacity-75">{quiz.subject}</p>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <FiCalendar className="text-gray-500 mr-2" />
                <span className="text-gray-700 font-medium">Start Time:</span>
                <span className="ml-2">{formatDate(submission.startTime)}</span>
              </div>
              <div className="flex items-center">
                <FiCalendar className="text-gray-500 mr-2" />
                <span className="text-gray-700 font-medium">End Time:</span>
                <span className="ml-2">{formatDate(submission.endTime)}</span>
              </div>
              <div className="flex items-center">
                <FiClock className="text-gray-500 mr-2" />
                <span className="text-gray-700 font-medium">Duration:</span>
                <span className="ml-2">{Math.round((new Date(submission.endTime) - new Date(submission.startTime)) / 60000)} minutes</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <HiOutlineQuestionMarkCircle className="text-gray-500 mr-2" />
                <span className="text-gray-700 font-medium">Total Questions:</span>
                <span className="ml-2">{result.totalQuestions}</span>
              </div>
              <div className="flex items-center">
                <FiCheckCircle className="text-green-500 mr-2" />
                <span className="text-gray-700 font-medium">Correct Answers:</span>
                <span className="ml-2">{result.correctAnswers}</span>
              </div>
              <div className="flex items-center">
                <FiXCircle className="text-red-500 mr-2" />
                <span className="text-gray-700 font-medium">Incorrect Answers:</span>
                <span className="ml-2">{result.answeredQuestions - result.correctAnswers}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Your Score</h3>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-0 sm:mr-4">
                {submission.totalMarksObtained}/{quiz.totalMarks}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`${getScoreColor(percentage)} h-4 rounded-full flex items-center justify-end`}
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-white text-xs px-2">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
          <h3 className="text-base sm:text-lg font-medium text-gray-800">Question Analysis</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {detailedResults.map((item, index) => (
            <div key={index} className="p-4 sm:p-6">
              <div className="flex flex-wrap items-start mb-3">
                <span className="bg-gray-100 text-gray-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 flex-shrink-0">
                  {index + 1}
                </span>
                <h4 className="text-base font-medium text-gray-800 flex-1">
                  {item.question}
                </h4>
                <div className="mt-2 sm:mt-0 ml-8 sm:ml-2 flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isCorrect ? (
                      <>
                        <FiCheckCircle className="mr-1" size={12} />
                        Correct
                      </>
                    ) : (
                      <>
                        <FiXCircle className="mr-1" size={12} />
                        Incorrect
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="ml-8 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.marksObtained}/{item.possibleMarks} marks
                </span>
              </div>
              
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Options:</p>
                <ul className="space-y-2">
                  {item.options.map((option, optIndex) => {
                    const isCorrectAnswer = option.text === item.correctAnswer;
                    const isSelectedAnswer = option.text === item.selectedAnswer;
                    const isCorrectSelection = isCorrectAnswer && isSelectedAnswer;
                    const isWrongSelection = !isCorrectAnswer && isSelectedAnswer;
                    
                    let bgColorClass = '';
                    if (isCorrectSelection) bgColorClass = 'bg-green-100';
                    else if (isCorrectAnswer) bgColorClass = 'bg-green-50';
                    else if (isWrongSelection) bgColorClass = 'bg-red-100';
                    
                    return (
                      <li 
                        key={optIndex} 
                        className={`p-3 rounded-md ${bgColorClass} flex items-start`}
                      >
                        <span className="bg-gray-200 text-gray-700 rounded-full h-5 w-5 flex items-center justify-center mr-2 flex-shrink-0 text-xs">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="flex-1">{option.text}</span>
                        {isCorrectAnswer && (
                          <FiCheckCircle className="ml-2 text-green-500 flex-shrink-0" />
                        )}
                        {isWrongSelection && (
                          <FiXCircle className="ml-2 text-red-500 flex-shrink-0" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
              
              {!item.selectedAnswer && (
                <div className="mt-3 text-sm text-gray-500 italic">
                  You did not answer this question
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
