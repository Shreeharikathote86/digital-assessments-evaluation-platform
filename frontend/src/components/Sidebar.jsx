import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser, FiCalendar, FiBook, FiClipboard, FiFileText, FiAward, FiBell, FiMenu, FiX } from 'react-icons/fi';
import { RxDashboard } from 'react-icons/rx';

const Sidebar = ({ selectedMenu, setSelectedMenu, userType, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(window.innerWidth >= 1024);
  
  // Use internal state if no external state management is provided
  const sidebarOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setSidebarOpen = setIsOpen || setInternalOpen;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  // Define menu items based on user type
  const getMenuItems = () => {
    const commonItems = [
      { id: 'Notice', label: 'Notices', icon: <FiBell /> }
    ];

    switch (userType) {
      case 'Student':
        return [
          { id: 'My Profile', label: 'My Profile', icon: <FiUser /> },
          { id: 'Timetable', label: 'Timetable', icon: <FiCalendar /> },
          { id: 'Marks', label: 'Marks', icon: <FiAward /> },
          { id: 'Assignments', label: 'Assignments', icon: <FiClipboard /> },
          { id: 'Quizzes', label: 'Quizzes', icon: <FiFileText /> },
          { id: 'Material', label: 'Material', icon: <FiBook /> },
          ...commonItems
        ];
      case 'Faculty':
        return [
          { id: 'My Profile', label: 'My Profile', icon: <FiUser /> },
          { id: 'Timetable', label: 'Timetable', icon: <FiCalendar /> },
          { id: 'Student Info', label: 'Student Search', icon: <FiUser /> },
          { id: 'Assignments', label: 'Assignments', icon: <FiClipboard /> },
          { id: 'Quizzes', label: 'Quizzes', icon: <FiFileText /> },
          { id: 'Material', label: 'Material', icon: <FiBook /> },
          { id: 'Upload Marks', label: 'Upload Marks', icon: <FiAward /> },
          ...commonItems
        ];
      case 'Admin':
        return [
          { id: 'Profile', label: 'My Profile', icon: <FiUser /> },
          { id: 'Faculty', label: 'Faculty', icon: <FiUser /> },
          { id: 'Student', label: 'Student', icon: <FiUser /> },
          { id: 'Branch', label: 'Branch', icon: <FiCalendar /> },
          { id: 'Timetable', label: 'Timetable', icon: <FiCalendar /> },
          { id: 'Subjects', label: 'Courses', icon: <FiBook /> },
          { id: 'Admin', label: 'Admin', icon: <FiUser /> },
          ...commonItems
        ];
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  const handleMenuItemClick = (itemId) => {
    setSelectedMenu(itemId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Mobile menu toggle button that appears in the fixed position
  const MobileMenuToggle = () => (
    <button 
      className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      aria-label="Toggle menu"
    >
      {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
    </button>
  );

  return (
    <>
      {/* Only show the mobile toggle when sidebar is not controlled externally or when it's closed */}
      {(!setIsOpen || !sidebarOpen) && <MobileMenuToggle />}
      
      <div 
        className={`h-screen bg-gray-800 text-white fixed left-0 top-0 overflow-y-auto transition-all duration-300 ease-in-out z-40 shadow-xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          w-[85vw] sm:w-72 lg:w-64`}
      >
        <div className="flex items-center justify-between mb-6 px-4 py-4 border-b border-gray-700">
          <div className="flex items-center">
            <RxDashboard className="text-2xl mr-2 text-blue-400" />
            <h1 className="text-xl font-bold">GradeHub | {userType}</h1>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={20} />
          </button>
        </div>
        
        <nav className="px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`flex items-center w-full px-4 py-3.5 rounded-lg transition-colors text-base
                    ${selectedMenu === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-8 w-full px-4">
          <button
            className="flex items-center justify-center w-full px-4 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-lg transition-colors shadow-md text-base font-medium"
            onClick={() => navigate("/")}
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Overlay to close sidebar when clicked outside on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
