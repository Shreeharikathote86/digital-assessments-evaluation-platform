import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import { FiBookOpen, FiAward } from 'react-icons/fi';
import { BsInfoCircle, BsCheckCircleFill, BsExclamationTriangleFill, BsXCircleFill } from 'react-icons/bs';
import { FaSpinner } from 'react-icons/fa';

const MarksView = () => {
  const { userData, userLoginId } = useSelector((state) => state);
  const [marks, setMarks] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch marks and subjects on component mount
  useEffect(() => {
    fetchMarks();
    fetchSubjects();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/marks/getMarks`, {
        enrollmentNo: userLoginId
      });
      
      if (response.data.success && response.data.Mark && response.data.Mark.length > 0) {
        setMarks(response.data.Mark[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching marks:', error);
      setError('Failed to load marks');
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      // Get student details to determine branch and semester
      const studentResponse = await axios.post(`${API_URL}/api/student/details/getStudentDetails`, {
        enrollmentNo: userLoginId
      });
      
      const student = studentResponse.data.Student;
      
      if (student) {
        // Fetch subjects for student's branch and semester
        const response = await axios.post(`${API_URL}/api/subject/getSubjectByBranchSem`, {
          branch: student.branch,
          semester: student.semester
        });
        
        setSubjects(response.data.Subject || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const getSubjectName = (subjectKey) => {
    const subject = subjects.find(s => s.subjectName === subjectKey);
    return subject ? subject.subjectName : subjectKey;
  };

  // This function has been replaced with an enhanced version below

  // Calculate overall statistics if marks are available
  const calculateOverallStats = () => {
    if (!marks || !marks.internal) return null;
    
    const subjectKeys = Object.keys(marks.internal);
    if (subjectKeys.length === 0) return null;
    
    let totalMarks = 0;
    let totalMaxMarks = 0;
    let passedSubjects = 0;
    
    subjectKeys.forEach(subject => {
      const subjectMarks = marks.internal[subject];
      const isa1 = subjectMarks.ISA1 || 0;
      const isa2 = subjectMarks.ISA2 || 0;
      const esa = subjectMarks.ESA || 0;
      const total = isa1 + isa2 + esa;
      const maxTotal = 100; // Assuming max total is 100
      
      totalMarks += total;
      totalMaxMarks += maxTotal;
      
      if ((total / maxTotal) * 100 >= 40) {
        passedSubjects++;
      }
    });
    
    return {
      totalMarks,
      totalMaxMarks,
      percentage: ((totalMarks / totalMaxMarks) * 100).toFixed(2),
      passedSubjects,
      totalSubjects: subjectKeys.length
    };
  };
  
  const stats = calculateOverallStats();

  const renderMarksTable = () => {
    if (!marks || !marks.internal) {
      return (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex items-center justify-center">
          <BsInfoCircle className="text-blue-500 mr-2" />
          <p className="text-blue-600 m-0">No marks data available. Complete assignments and quizzes to see your marks.</p>
        </div>
      );
    }

    const subjectKeys = Object.keys(marks.internal);
    
    if (subjectKeys.length === 0) {
      return (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex items-center justify-center">
          <BsInfoCircle className="text-blue-500 mr-2" />
          <p className="text-blue-600 m-0">No marks data available. Complete assignments and quizzes to see your marks.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Subject</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700 border-b">ISA1</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700 border-b">ISA2</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700 border-b">ESA</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700 border-b">Total</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {subjectKeys.map((subjectKey, index) => {
              const subjectMarks = marks.internal[subjectKey];
              const isa1 = subjectMarks.ISA1 || 0;
              const isa2 = subjectMarks.ISA2 || 0;
              const esa = subjectMarks.ESA || 0;
              const total = isa1 + isa2 + esa;
              const maxTotal = 100; // Assuming max total is 100
              const percentage = (total / maxTotal) * 100;
              
              return (
                <tr key={subjectKey} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4 border-b text-gray-800">{getSubjectName(subjectKey)}</td>
                  <td className="py-3 px-4 border-b text-center">
                    <span className="inline-block bg-blue-50 text-blue-600 rounded-full px-3 py-1 font-medium">
                      {isa1 !== 0 ? isa1 : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <span className="inline-block bg-blue-50 text-blue-600 rounded-full px-3 py-1 font-medium">
                      {isa2 !== 0 ? isa2 : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <span className="inline-block bg-blue-50 text-blue-600 rounded-full px-3 py-1 font-medium">
                      {esa !== 0 ? esa : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b text-center font-semibold">{total}</td>
                  <td className="py-3 px-4 border-b text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${percentage >= 70 ? 'bg-green-50 text-green-600' : percentage >= 40 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                      {percentage >= 70 ? (
                        <><BsCheckCircleFill className="mr-1" /> Excellent</>
                      ) : percentage >= 40 ? (
                        <><BsExclamationTriangleFill className="mr-1" /> Pass</>
                      ) : (
                        <><BsXCircleFill className="mr-1" /> Needs Improvement</>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center">
          <FiBookOpen className="text-white text-2xl mr-3" />
          <h2 className="text-xl font-bold text-white">My Academic Performance</h2>
        </div>
        
        {!loading && !error && stats && (
          <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-4 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-100">Total Marks</p>
                <p className="text-2xl font-bold">{stats.totalMarks}/{stats.totalMaxMarks}</p>
              </div>
              <div className="text-center border-l border-r border-white border-opacity-20">
                <p className="text-sm font-medium text-blue-100">Overall Percentage</p>
                <p className="text-2xl font-bold">{stats.percentage}%</p>
              </div>
              <div className="text-center border-r border-white border-opacity-20">
                <p className="text-sm font-medium text-blue-100">Subjects Passed</p>
                <p className="text-2xl font-bold">{stats.passedSubjects}/{stats.totalSubjects}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-blue-100">Overall Status</p>
                <p className="text-xl font-bold flex items-center justify-center">
                  <FiAward className="mr-2" />
                  {parseFloat(stats.percentage) >= 70 ? "Excellent" : 
                   parseFloat(stats.percentage) >= 40 ? "Pass" : "Needs Improvement"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all">
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-start mb-6">
            <BsInfoCircle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-blue-500 text-3xl mb-2" />
              <p className="text-gray-600">Loading marks data...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3 inline-block"></span>
                Assessment Marks
              </h3>
              <p className="text-gray-600 mb-4">
                This shows your marks from assignments, quizzes, and exams for the current semester.
              </p>
              {renderMarksTable()}
            </div>
            
            <div className="mt-8 bg-blue-50 p-5 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Mark Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="text-blue-600 font-medium mb-2">ISA1 (Internal Assessment 1)</h4>
                  <p className="text-gray-600">First internal assessment marks from assignments and quizzes</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="text-blue-600 font-medium mb-2">ISA2 (Internal Assessment 2)</h4>
                  <p className="text-gray-600">Second internal assessment marks from assignments and quizzes</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="text-blue-600 font-medium mb-2">ESA (End Semester Assessment)</h4>
                  <p className="text-gray-600">Final assessment marks from assignments and exams</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarksView;
