import React, { useState, useEffect } from "react";
import { baseApiURL } from "../../baseUrl";
import axios from "axios";

const Student = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Fetch all students on component mount
  useEffect(() => {
    fetchAllStudents();
  }, []);

  // Function to fetch all students
  const fetchAllStudents = () => {
    setLoadingStudents(true);
    setError(null);
    
    // Using the existing getDetails endpoint with empty body to get all students
    axios
      .post(`${baseApiURL()}/student/details/getStudentsDetails`, {})
      .then((response) => {
        setLoadingStudents(false);
        
        if (response.data.success) {
          setAllStudents(response.data.user || []);
          if (response.data.user.length === 0) {
            setError("No students found in the system");
            showNotification("No students found", "warning");
          } else {
            showNotification(`Found ${response.data.user.length} students`, "success");
          }
        } else {
          setError(response.data.message);
          showNotification(response.data.message, "error");
        }
      })
      .catch((error) => {
        setLoadingStudents(false);
        setError(error.response?.data?.message || "Failed to fetch students");
        showNotification(error.response?.data?.message || "Failed to fetch students", "error");
        console.error(error);
      });
  };

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
    
    axios
      .post(
        `${baseApiURL()}/student/details/getDetails`,
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
          setError(response.data.message);
          showNotification(response.data.message, "error");
        }
      })
      .catch((error) => {
        setLoading(false);
        dismissNotification();
        setError(error.response?.data?.message || "Failed to search for student");
        showNotification(error.response?.data?.message || "Failed to search for student", "error");
        console.error(error);
      });
  };

  // Notification handling (replace with your toast implementation)
  const showNotification = (message, type) => {
    // This is a placeholder for your toast implementation
    console.log(`[${type}] ${message}`);
  };

  const dismissNotification = () => {
    // Placeholder for toast dismiss
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* We don't need the navigation bar since we're in the faculty dashboard */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Student Information System</h1>
          <p className="mt-2 text-slate-500">Search and view detailed student profiles in our database</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-medium text-slate-800 mb-4">Find Student</h2>
          <form onSubmit={searchStudentHandler} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
                placeholder="Enter enrollment number (e.g., EN12345)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Student Information */}
        {data && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Student Header */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-6 py-6 md:py-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  {data.profile ? (
                    <img
                      src={process.env.REACT_APP_MEDIA_LINK + "/" + data.profile}
                      alt="Student"
                      className="h-16 w-16 rounded-full object-cover border-2 border-white"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/200x200?text=N/A";
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-xl font-bold text-indigo-600 border-2 border-white">
                      {getInitials(data.firstName, data.lastName)}
                    </div>
                  )}
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-white">{`${data.firstName} ${data.middleName || ''} ${data.lastName}`}</h2>
                    <p className="text-indigo-100 flex items-center mt-1">
                      <span className="inline-block mr-2">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </span>
                      {data.enrollmentNo}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Semester {data.semester}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {data.branch}
                  </span>
                </div>
              </div>
            </div>

            {/* Student Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-base font-medium text-slate-800 mb-4 flex items-center">
                    <svg className="h-5 w-5 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  
                  <div className="bg-slate-50 rounded-lg p-5">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-500 truncate">Full Name</p>
                          <p className="text-sm font-medium text-slate-800">{`${data.firstName} ${data.middleName || ''} ${data.lastName}`}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-500 truncate">Enrollment Number</p>
                          <p className="text-sm font-medium text-slate-800">{data.enrollmentNo}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-500 truncate">Gender</p>
                          <p className="text-sm font-medium text-slate-800 capitalize">{data.gender}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div>
                  <h3 className="text-base font-medium text-slate-800 mb-4 flex items-center">
                    <svg className="h-5 w-5 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Information
                  </h3>
                  
                  <div className="bg-slate-50 rounded-lg p-5">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-500 truncate">Email Address</p>
                          <p className="text-sm font-medium text-slate-800">{data.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-500 truncate">Phone Number</p>
                          <p className="text-sm font-medium text-slate-800">+91 {data.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Academic Information */}
                <div className="md:col-span-2">
                  <h3 className="text-base font-medium text-slate-800 mb-4 flex items-center">
                    <svg className="h-5 w-5 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    Academic Information
                  </h3>
                  
                  <div className="bg-slate-50 rounded-lg p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-500 truncate">Branch</p>
                          <p className="text-sm font-medium text-slate-800">{data.branch}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-500 truncate">Current Semester</p>
                          <p className="text-sm font-medium text-slate-800">Semester {data.semester}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  View Full Profile
                </button>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Print Details
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Student List Section */}
        {!data && !loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-slate-800">Student Directory</h2>
              <button 
                onClick={fetchAllStudents}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            
            {loadingStudents ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : allStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment No</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allStudents.map((student, index) => (
                      <tr key={student._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium">
                                {getInitials(student.firstName, student.lastName)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.enrollmentNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.branch || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.semester || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => {
                              setSearch(student.enrollmentNo);
                              searchStudentHandler({ preventDefault: () => {} });
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">No Students Found</h3>
                <p className="text-slate-500 max-w-md">There are no students in the system or we couldn't retrieve the student list.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <svg className="animate-spin w-10 h-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Searching for Student</h3>
            <p className="text-slate-500 max-w-md">Please wait while we retrieve the student information...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && !data && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Error</h3>
            <p className="text-slate-500 max-w-md">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchAllStudents();
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Student;