import React, { useState } from "react";
import { baseApiURL } from "../../baseUrl";
import axios from "axios";
import { FaSearch, FaUser, FaSpinner } from "react-icons/fa";

const StudentSearch = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Search for a student by enrollment number
  const searchStudentHandler = (e) => {
    e.preventDefault();
    
    if (!search.trim()) {
      showNotification("Please enter an enrollment number", "error");
      return;
    }
    
    setData(null);
    setError(null);
    setLoading(true);
    showNotification("Searching for student...", "loading");
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    // Try both endpoints to ensure we find the student
    searchWithEndpoint(`${baseApiURL()}/student/details/getDetails`, headers)
      .catch(() => {
        // If the first endpoint fails, try the alternative
        return searchWithEndpoint(`${baseApiURL()}/student/details/getStudentDetails`, headers);
      })
      .catch((error) => {
        setLoading(false);
        dismissNotification();
        setError(error.response?.data?.message || "Failed to search for student");
        showNotification(error.response?.data?.message || "Failed to search for student", "error");
        console.error(error);
      });
  };

  // Helper function to search with a specific endpoint
  const searchWithEndpoint = (endpoint, headers) => {
    return axios
      .post(
        endpoint,
        { enrollmentNo: search },
        { headers }
      )
      .then((response) => {
        dismissNotification();
        setLoading(false);
        
        if (response.data.success) {
          if (response.data.user.length === 0) {
            setError("No student found with this enrollment number");
            showNotification("No student found!", "error");
          } else {
            showNotification("Student found!", "success");
            setData(response.data.user[0]);
          }
        } else {
          throw new Error(response.data.message || "Failed to find student");
        }
      });
  };

  // Notification handling
  const showNotification = (message, type) => {
    setNotification({ message, type });
    if (type !== "loading") {
      setTimeout(() => {
        dismissNotification();
      }, 3000);
    }
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  // Get initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className="w-full">
      {/* Main Content */}
      <div className="mx-auto px-2 sm:px-4 py-2 sm:py-4">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">Student Information</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-500">Search and view detailed student profiles</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <form onSubmit={searchStudentHandler} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter student enrollment number"
                className="block w-full pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-center text-sm sm:text-base ${
            notification.type === "error" ? "bg-red-50 text-red-700" : 
            notification.type === "success" ? "bg-green-50 text-green-700" : 
            "bg-blue-50 text-blue-700"
          }`}>
            {notification.type === "loading" ? (
              <FaSpinner className="animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            ) : notification.type === "error" ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Student Details */}
        {data && !loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Student Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-3 sm:p-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white flex items-center justify-center text-indigo-600 text-xl sm:text-2xl font-bold overflow-hidden">
                  {data.profile ? (
                    <img 
                      src={`${process.env.REACT_APP_MEDIA_LINK}/${data.profile}`} 
                      alt={`${data.firstName} ${data.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${getInitials(data.firstName, data.lastName)}&background=4F46E5&color=ffffff&size=128`;
                      }}
                    />
                  ) : (
                    getInitials(data.firstName, data.lastName)
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {data.firstName} {data.middleName} {data.lastName}
                  </h2>
                  <p className="text-indigo-100 text-sm sm:text-base">
                    Enrollment: <span className="font-medium">{data.enrollmentNo}</span>
                  </p>
                  <p className="text-indigo-100 text-sm sm:text-base">
                    Branch: <span className="font-medium">{data.branch}</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Student Information */}
            <div className="p-3 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm text-gray-500 mb-1">Semester</h3>
                  <p className="font-medium text-gray-800">{data.semester}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm text-gray-500 mb-1">Date of Birth</h3>
                  <p className="font-medium text-gray-800">{new Date(data.dob).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm text-gray-500 mb-1">Gender</h3>
                  <p className="font-medium text-gray-800">{data.gender}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm text-gray-500 mb-1">Email</h3>
                  <p className="font-medium text-gray-800 break-all text-sm sm:text-base">{data.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm text-gray-500 mb-1">Mobile</h3>
                  <p className="font-medium text-gray-800">{data.mobile}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="text-sm text-gray-500 mb-1">Address</h3>
                  <p className="font-medium text-gray-800 text-sm sm:text-base">{data.address}</p>
                </div>
              </div>
              
              {/* Academic Information */}
              <div className="mt-4 sm:mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm text-gray-500 mb-1">Course</h3>
                    <p className="font-medium text-gray-800">{data.course}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm text-gray-500 mb-1">Batch</h3>
                    <p className="font-medium text-gray-800">{data.batch}</p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button className="flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Academic Records
                </button>
                <button className="flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Student
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Initial State - No Results Yet */}
        {!data && !loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <FaUser className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-1 sm:mb-2">No Student Selected</h3>
            <p className="text-slate-500 text-sm sm:text-base max-w-md">Enter a student enrollment number in the search box above to view their detailed information.</p>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center">
              <FaSpinner className="animate-spin w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-1 sm:mb-2">Searching for Student</h3>
            <p className="text-slate-500 text-sm sm:text-base max-w-md">Please wait while we retrieve the student information...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && !data && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-1 sm:mb-2">Error</h3>
            <p className="text-slate-500 text-sm sm:text-base max-w-md">{error}</p>
            <button 
              onClick={() => {
                setError(null);
              }}
              className="mt-3 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSearch;
