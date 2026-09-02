import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Notice from "../../components/Notice";
import Profile from "./Profile";
import Timetable from "./Timetable";
import { Toaster } from "react-hot-toast";
import Material from "./Material";
import Marks from "./Marks";
import StudentSearch from "./StudentSearch";
import AssignmentManagement from "./AssignmentManagement";
import QuizManagement from "./QuizManagement";
import { FaSpinner } from "react-icons/fa";

const Home = () => {
  const router = useLocation();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState("My Profile");
  const [load, setLoad] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    if (router.state === null) {
      navigate("/");
    }
    setLoad(true);
    // Simulate content loading
    const timer = setTimeout(() => {
      setLoadingContent(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [navigate, router.state]);

  return (
    <section className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {!load ? (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="flex flex-col items-center justify-center">
            <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          <Sidebar 
            selectedMenu={selectedMenu} 
            setSelectedMenu={setSelectedMenu} 
            userType="Faculty"
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />
          <div className={`flex-1 w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
            <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="p-3 sm:p-4 md:p-6 max-w-full overflow-hidden">
              <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100">
                  <div className="w-1 sm:w-1.5 h-5 sm:h-6 bg-blue-600 rounded-full mr-2 sm:mr-3"></div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">{selectedMenu}</h1>
                </div>
                
                {loadingContent ? (
                  <div className="flex justify-center items-center py-10 sm:py-20">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    {selectedMenu === "My Profile" && <Profile />}
                    {selectedMenu === "Student Info" && <StudentSearch />}
                    {selectedMenu === "Upload Marks" && <Marks />}
                    {selectedMenu === "Assignments" && <AssignmentManagement />}
                    {selectedMenu === "Quizzes" && <QuizManagement />}
                    {selectedMenu === "Timetable" && <Timetable />}
                    {selectedMenu === "Material" && <Material />}
                    {selectedMenu === "Notice" && <Notice />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <Toaster position="top-center" reverseOrder={false} />
    </section>
  );
};

export default Home;
