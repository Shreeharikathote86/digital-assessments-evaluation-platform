import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Profile from "./Profile";
import Timetable from "./Timetable";
import Notice from "../../components/Notice";
import Material from "./Material";
import AssignmentList from "./AssignmentList";
import QuizList from "./QuizList";
import EnhancedMarksView from "./EnhancedMarksView";
import { Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("My Profile");
  const router = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (router.state === null) {
      navigate("/");
    } else {
      // Save the student ID to localStorage for use in other components
      if (router.state.loginid) {
        console.log('Saving student ID to localStorage:', router.state.loginid);
        localStorage.setItem('userLoginId', router.state.loginid);
      }
    }
    setLoad(true);
    // Simulate content loading
    const timer = setTimeout(() => {
      setLoadingContent(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [navigate, router.state]);

  return (
    <section className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {!load ? (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we prepare your student portal</p>
          </div>
        </div>
      ) : (
        <>
          <Sidebar 
            selectedMenu={selectedMenu} 
            setSelectedMenu={setSelectedMenu} 
            userType="Student"
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
                    <div className={`${selectedMenu === "My Profile" ? "block" : "hidden"}`}>
                      <Profile />
                    </div>
                    <div className={`${selectedMenu === "Timetable" ? "block" : "hidden"}`}>
                      <Timetable />
                    </div>
                    <div className={`${selectedMenu === "Marks" ? "block" : "hidden"}`}>
                      <EnhancedMarksView />
                    </div>
                    <div className={`${selectedMenu === "Assignments" ? "block" : "hidden"}`}>
                      <AssignmentList />
                    </div>
                    <div className={`${selectedMenu === "Quizzes" ? "block" : "hidden"}`}>
                      <QuizList />
                    </div>
                    <div className={`${selectedMenu === "Material" ? "block" : "hidden"}`}>
                      <Material />
                    </div>
                    <div className={`${selectedMenu === "Notice" ? "block" : "hidden"}`}>
                      <Notice />
                    </div>
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
