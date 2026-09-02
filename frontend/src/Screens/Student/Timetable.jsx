import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiDownload, FiCalendar } from "react-icons/fi";
import { BsCalendarWeek, BsClockHistory } from "react-icons/bs";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { baseApiURL } from "../../baseUrl";

const Timetable = () => {
  const [timetable, setTimetable] = useState("");
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state) => state.userData);

  useEffect(() => {
    const getTimetable = () => {
      if (!userData || !userData.semester || !userData.branch) {
        console.log("Missing user data for timetable request", userData);
        return;
      }
      
      setLoading(true);
      console.log("Fetching timetable for:", {
        semester: userData.semester,
        branch: userData.branch
      });
      
      // For GET requests, params should be in the params object, not the second parameter
      axios
        .post(
          `${baseApiURL()}/timetable/getTimetable`,
          { semester: userData.semester, branch: userData.branch },
          {
            headers: {
              "Content-Type": "application/json",
            }
          }
        )
        .then((response) => {
          setLoading(false);
          console.log("Timetable response:", response.data);
          if (response.data && response.data.length !== 0) {
            setTimetable(response.data[0].link);
          }
        })
        .catch((error) => {
          setLoading(false);
          toast.dismiss();
          console.error("Error fetching timetable:", error);
        });
    };
    
    if (userData) {
      getTimetable();
    }
  }, [userData, userData?.branch, userData?.semester]);

  return (
    <div className="w-full mx-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 sm:p-5 rounded-lg shadow-lg mb-4 sm:mb-6 w-full">
        <div className="flex items-center">
          <div className="mr-3 text-3xl sm:text-4xl">
            <BsCalendarWeek />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">Class Timetable</h2>
            <p className="text-sm sm:text-base opacity-75 mb-0">Semester {userData.semester} • {userData.branch}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full mb-4">
        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center">
            <BsClockHistory className="mr-2 text-indigo-600" />
            <h5 className="text-base sm:text-lg font-medium text-gray-800 mb-0">Weekly Schedule</h5>
          </div>
          {timetable && (
            <button
              className="flex items-center px-3 py-1.5 text-sm sm:text-base border border-indigo-500 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              onClick={() =>
                window.open(timetable.includes('cloudinary.com') ? timetable : process.env.REACT_APP_MEDIA_LINK + "/" + timetable)
              }
            >
              <FiDownload className="mr-1.5" />
              Download
            </button>
          )}
        </div>
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                <p className="text-gray-500 text-sm">Loading timetable...</p>
              </div>
            </div>
          ) : timetable ? (
            <div className="text-center">
              <div className="relative w-full overflow-auto">
                <img
                  className="rounded-lg shadow-sm mx-auto"
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                  src={timetable.includes('cloudinary.com') ? timetable : process.env.REACT_APP_MEDIA_LINK + "/" + timetable}
                  alt="timetable"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/800x600?text=Timetable+Image+Error";
                  }}
                />
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mt-3">
                Click the Download button to save the timetable for offline reference
              </p>
              <div className="mt-4 sm:hidden">
                <p className="text-xs text-gray-500">
                  Tip: Pinch to zoom or rotate your device for a better view
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-gray-400 mb-3">
                <FiCalendar size={48} className="mx-auto" />
              </div>
              <h5 className="text-lg font-medium text-gray-800 mb-2">No Timetable Available</h5>
              <p className="text-gray-500 text-sm">The timetable for this semester has not been uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timetable;
