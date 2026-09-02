import React from "react";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";

const Navbar = ({ toggleSidebar }) => {
  const router = useLocation();
  const navigate = useNavigate();
  
  // Ensure toggleSidebar is a function even if not provided
  const handleToggleSidebar = () => {
    if (typeof toggleSidebar === 'function') {
      toggleSidebar();
    }
  };
  
  return (
    <div className="shadow-md px-4 md:px-6 py-4">
      <div className="max-w-6xl flex justify-between items-center mx-auto">
        <div className="flex items-center">
          <button 
            className="mr-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={handleToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FiMenu size={24} className="text-gray-700" />
          </button>
          <div className="flex-1 flex justify-start lg:justify-center items-center">
            <p
              className="font-semibold text-lg sm:text-xl md:text-2xl flex justify-center items-center cursor-pointer truncate"
              onClick={() => navigate("/")}
            >
              <span className="mr-2">
                <RxDashboard />
              </span>
              <span className="hidden sm:inline">
                GradeHub | {router.state && router.state.type ? router.state.type : "User"} Dashboard
              </span>
              <span className="sm:hidden">GradeHub</span>
            </p>
          </div>
        </div>
        <button
          className="flex justify-center items-center text-red-500 px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base font-semibold rounded-sm ml-2"
          onClick={() => navigate("/")}
        >
          <span className="hidden sm:inline mr-2">Logout</span>
          <span>
            <FiLogOut />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
