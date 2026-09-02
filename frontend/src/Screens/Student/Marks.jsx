import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { baseApiURL } from "../../baseUrl";
import { FiBookOpen } from "react-icons/fi";
import { BsInfoCircle } from "react-icons/bs";
import { FaSpinner } from "react-icons/fa";

const Marks = () => {
  const userData = useSelector((state) => state.userData);
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarks = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = {
          "Content-Type": "application/json",
        };
        const response = await axios.post(
          `${baseApiURL()}/marks/getMarks`,
          { enrollmentNo: userData.enrollmentNo },
          { headers }
        );

        if (response.data && response.data.Mark && response.data.Mark.length > 0) {
          setMarksData(response.data.Mark[0]);
        } else {
          setError("No marks data available for this semester.");
        }
      } catch (error) {
        console.error("Error fetching marks:", error);
        setError("Failed to load marks data. Please try again later.");
        toast.error("Failed to load marks data");
      } finally {
        setLoading(false);
      }
    };

    if (userData && userData.enrollmentNo) {
      fetchMarks();
    }
  }, [userData]);

  // Helper function to calculate total marks and percentage
  const calculateStats = (marksData) => {
    if (!marksData) return { total: 0, percentage: 0 };
    
    let totalMarks = 0;
    let maxMarks = 0;
    
    // Add ISA1 marks (typically out of 20)
    if (marksData.ISA1) {
      Object.values(marksData.ISA1).forEach(mark => {
        if (!isNaN(mark)) {
          totalMarks += Number(mark);
          maxMarks += 20; // Assuming ISA1 is out of 20 for each subject
        }
      });
    }
    
    // Add ISA2 marks (typically out of 20)
    if (marksData.ISA2) {
      Object.values(marksData.ISA2).forEach(mark => {
        if (!isNaN(mark)) {
          totalMarks += Number(mark);
          maxMarks += 20; // Assuming ISA2 is out of 20 for each subject
        }
      });
    }
    
    // Add ESA marks (typically out of 60)
    if (marksData.ESA) {
      Object.values(marksData.ESA).forEach(mark => {
        if (!isNaN(mark)) {
          totalMarks += Number(mark);
          maxMarks += 60; // Assuming ESA is out of 60 for each subject
        }
      });
    }
    
    const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
    
    return {
      total: totalMarks,
      maxTotal: maxMarks,
      percentage: percentage.toFixed(2)
    };
  };

  // Function to render a marks section
  const renderMarksSection = (title, data, maxMarks) => {
    if (!data) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-6 bg-blue-600 rounded-full mr-3 inline-block"></span>
          {title} <span className="text-gray-500 text-base ml-2">(Out of {maxMarks})</span>
        </h3>
        
        {Object.keys(data).length > 0 ? (
          <div className="mt-4">
            <div className="bg-gray-50 rounded-lg p-3 mb-3 flex justify-between font-medium text-gray-600">
              <span>Subject</span>
              <span>Marks</span>
            </div>
            {Object.keys(data).map((subject, index) => (
              <div 
                key={index}
                className="flex justify-between items-center py-3 px-3 border-b border-gray-100 last:border-0"
              >
                <p className="text-gray-700">{subject}</p>
                <span className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {data[subject]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No marks available for this assessment</p>
        )}
      </div>
    );
  };

  // Get statistics if marks data is available
  const stats = calculateStats(marksData);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center">
          <FiBookOpen className="text-white text-2xl mr-3" />
          <h2 className="text-xl font-bold text-white">
            Marks for Semester {userData?.semester || '-'}
          </h2>
        </div>
        {!loading && !error && marksData && (
          <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-4 text-white">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-100">Total Marks</p>
                <p className="text-2xl font-bold">{stats.total}/{stats.maxTotal}</p>
              </div>
              <div className="text-center border-l border-r border-white border-opacity-20">
                <p className="text-sm font-medium text-blue-100">Percentage</p>
                <p className="text-2xl font-bold">{stats.percentage}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-blue-100">Status</p>
                <p className="text-xl font-bold">
                  {parseFloat(stats.percentage) >= 40 ? "Pass" : "Needs Improvement"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-blue-500 text-3xl mb-2" />
            <p className="text-gray-600">Loading marks data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-lg border border-red-100 flex items-start">
          <BsInfoCircle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
          <div>
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-red-500 mt-1">Please check with your faculty if you believe this is an error.</p>
          </div>
        </div>
      ) : marksData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderMarksSection("ISA 1 Marks", marksData.ISA1, 20)}
          {renderMarksSection("ISA 2 Marks", marksData.ISA2, 20)}
          {renderMarksSection("ESA Marks", marksData.ESA, 60)}
        </div>
      ) : (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex flex-col items-center justify-center h-64">
          <FiBookOpen className="text-blue-500 text-4xl mb-3" />
          <p className="text-blue-600 text-center font-medium">No marks data available for this semester</p>
          <p className="text-blue-500 text-center mt-2">Marks will appear here once they are published by faculty</p>
        </div>
      )}
    </div>
  );
};

export default Marks;
