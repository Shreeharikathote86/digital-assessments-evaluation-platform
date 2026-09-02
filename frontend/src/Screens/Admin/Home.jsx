/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import Notice from "../../components/Notice";
import StudentManagement from "./StudentManagement";
import Faculty from "./Faculty";
import Subjects from "./Subject";
import { baseApiURL } from "../../baseUrl";
import Admin from "./Admin";
import Profile from "./Profile";
import Branch from "./Branch";
import Timetable from "./Timetable";
import { FaSpinner } from "react-icons/fa";

const Home = () => {
  const router = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    studentCount: "",
    facultyCount: "",
  });

  // Handle initial loading and navigation
  useEffect(() => {
    // Check if we're coming from a login or if there's stored admin data
    const hasStoredAdminData = localStorage.getItem('adminData') !== null;
    
    if (router.state === null && !hasStoredAdminData) {
      // If no state and no stored data, redirect to login
      navigate("/");
    } else {
      // If we have router state, store it for future page reloads
      if (router.state) {
        localStorage.setItem('adminData', JSON.stringify({
          type: 'Admin',
          loginTime: new Date().toISOString()
        }));
      }
      
      // Set load to true to render the dashboard
      setLoad(true);
      
      // Simulate content loading
      const timer = setTimeout(() => {
        setLoadingContent(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, router.state]);

  // Fetch dashboard data
  useEffect(() => {
    if (load) {
      getStudentCount();
      getFacultyCount();
    }
  }, [load]);

  // Handle sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getStudentCount = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/student/details/count`, {
        headers: headers,
      })
      .then((response) => {
        if (response.data.success) {
          setDashboardData({
            ...dashboardData,
            studentCount: response.data.user,
          });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getFacultyCount = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/faculty/details/count`, {
        headers: headers,
      })
      .then((response) => {
        if (response.data.success) {
          setDashboardData({
            ...dashboardData,
            facultyCount: response.data.user,
          });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <section className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {!load ? (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we prepare your admin portal</p>
          </div>
        </div>
      ) : (
        <>
          <Sidebar 
            selectedMenu={selectedMenu} 
            setSelectedMenu={setSelectedMenu} 
            userType="Admin"
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />
          <div className={`flex-1 w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
            <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="p-3 sm:p-4 md:p-6">
              <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{selectedMenu}</h1>
                </div>
                
                {loadingContent ? (
                  <div className="flex justify-center items-center py-12 sm:py-20">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                      <p className="text-gray-500 text-sm">Loading content...</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    {selectedMenu === "Profile" && <Profile />}
                    {selectedMenu === "Student" && <StudentManagement />}
                    {selectedMenu === "Faculty" && <Faculty />}
                    {selectedMenu === "Branch" && <Branch />}
                    {selectedMenu === "Notice" && <Notice />}
                    {selectedMenu === "Subjects" && <Subjects />}
                    {selectedMenu === "Timetable" && <Timetable />}
                    {selectedMenu === "Admin" && <Admin />}
                    
                    {/* Dashboard Summary - Show when Dashboard is selected */}
                    {selectedMenu === "Dashboard" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-blue-50 p-4 md:p-6 rounded-lg shadow-sm">
                          <h3 className="text-lg font-semibold mb-2">Student Count</h3>
                          <p className="text-2xl md:text-3xl font-bold text-blue-600">{dashboardData.studentCount || 0}</p>
                        </div>
                        <div className="bg-green-50 p-4 md:p-6 rounded-lg shadow-sm">
                          <h3 className="text-lg font-semibold mb-2">Faculty Count</h3>
                          <p className="text-2xl md:text-3xl font-bold text-green-600">{dashboardData.facultyCount || 0}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
          },
        }} 
      />
    </section>
  );
};

export default Home;
