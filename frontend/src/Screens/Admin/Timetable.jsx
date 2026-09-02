import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Heading from "../../components/Heading";
import { baseApiURL } from "../../baseUrl";
import { FiCalendar, FiClock, FiPlus, FiSearch, FiTrash2, FiUsers, FiFilter } from "react-icons/fi";

const Timetable = () => {
  const [selected, setSelected] = useState("add");
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [filteredTimetables, setFilteredTimetables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    branch: "",
    semester: "",
    subject: "",
    day: "",
    time: "",
    facultyName: "",
  });

  // Days of the week options
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Time slots
  const timeSlots = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
  ];

  useEffect(() => {
    getBranchData();
    getSubjectData();
    getTimetableData();
  }, []);

  // Filter timetables based on search term
  useEffect(() => {
    if (!timetables) return;
    
    if (searchTerm.trim() === "") {
      setFilteredTimetables(timetables);
    } else {
      const filtered = timetables.filter(
        (item) =>
          item.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.day?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.facultyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTimetables(filtered);
    }
  }, [searchTerm, timetables]);

  // Get all branches
  const getBranchData = () => {
    setLoading(true);
    axios
      .get(`${baseApiURL()}/branch/getBranch`)
      .then((response) => {
        if (response.data.success) {
          setBranches(response.data.branches || []);
        } else {
          toast.error(response.data.message);
        }
        setLoading(false);
      })
      .catch((error) => {
        toast.error(error.message || "Failed to fetch branches");
        setLoading(false);
      });
  };

  // Get all subjects
  const getSubjectData = () => {
    setLoading(true);
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((response) => {
        if (response.data.success) {
          setSubjects(response.data.subject || []);
        } else {
          toast.error(response.data.message);
        }
        setLoading(false);
      })
      .catch((error) => {
        toast.error(error.message || "Failed to fetch subjects");
        setLoading(false);
      });
  };

  // Get all timetables
  const getTimetableData = () => {
    setLoading(true);
    axios
      .get(`${baseApiURL()}/timetable/getTimetable`)
      .then((response) => {
        if (response.data.success) {
          setTimetables(response.data.timetable || []);
          setFilteredTimetables(response.data.timetable || []);
        } else {
          toast.error(response.data.message);
        }
        setLoading(false);
      })
      .catch((error) => {
        toast.error(error.message || "Failed to fetch timetable");
        setLoading(false);
      });
  };

  // Add timetable entry
  const addTimetableHandler = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.branch || !formData.semester || !formData.subject || !formData.day || !formData.time) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setLoading(true);
    toast.loading("Adding Timetable Entry");
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    axios
      .post(`${baseApiURL()}/timetable/addTimetable`, formData, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setFormData({
            branch: "",
            semester: "",
            subject: "",
            day: "",
            time: "",
            facultyName: "",
          });
          getTimetableData();
        } else {
          toast.error(response.data.message);
        }
        setLoading(false);
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.message || "Failed to add timetable entry");
        setLoading(false);
      });
  };

  // Delete timetable entry
  const deleteTimetableHandler = (id) => {
    if (window.confirm("Are you sure you want to delete this timetable entry?")) {
      setLoading(true);
      toast.loading("Deleting Timetable Entry");
      
      axios
        .delete(`${baseApiURL()}/timetable/deleteTimetable/${id}`)
        .then((response) => {
          toast.dismiss();
          if (response.data.success) {
            toast.success(response.data.message);
            getTimetableData();
          } else {
            toast.error(response.data.message);
          }
          setLoading(false);
        })
        .catch((error) => {
          toast.dismiss();
          toast.error(error.message || "Failed to delete timetable entry");
          setLoading(false);
        });
    }
  };

  return (
    <div className="w-full mx-auto mt-6 md:mt-8 lg:mt-10 flex justify-center items-start flex-col mb-6 md:mb-8 lg:mb-10 px-4 md:px-6 lg:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 sm:gap-0">
        <Heading title="Timetable Management" />
        
        <div className="flex space-x-2">
          <button
            onClick={() => setSelected("add")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selected === "add"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <span className="flex items-center">
              <FiPlus className="mr-1" />
              <span>Add</span>
            </span>
          </button>
          <button
            onClick={() => setSelected("view")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selected === "view"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <span className="flex items-center">
              <FiCalendar className="mr-1" />
              <span>View</span>
            </span>
          </button>
        </div>
      </div>

      {selected === "add" ? (
        <div className="w-full mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Timetable Entry</h2>
          
          <form onSubmit={addTimetableHandler} className="w-full flex flex-wrap justify-between items-start">
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                id="branch"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                id="semester"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                Day <span className="text-red-500">*</span>
              </label>
              <select
                id="day"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                required
              >
                <option value="">Select Day</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <select
                id="time"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              >
                <option value="">Select Time Slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="facultyName" className="block text-sm font-medium text-gray-700 mb-1">
                Faculty Name
              </label>
              <input
                type="text"
                id="facultyName"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                placeholder="Enter faculty name (optional)"
                value={formData.facultyName}
                onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
              />
            </div>
            
            <div className="w-full flex justify-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-md text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Timetable Entry"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="w-full mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <h2 className="text-xl font-semibold text-gray-800">Timetable Entries</h2>
            
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiSearch className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search timetable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTimetables.length > 0 ? (
            <div className="overflow-x-auto">
              {/* Desktop view - Table */}
              <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTimetables.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.branch}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.semester}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.day}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.facultyName || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-red-600 hover:text-red-900 ml-4 flex items-center justify-end w-full"
                          onClick={() => deleteTimetableHandler(item._id)}
                        >
                          <FiTrash2 className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Mobile view - Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredTimetables.map((item) => (
                  <div key={item._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.subject}</h3>
                        <p className="text-sm text-gray-500">{item.branch} - Semester {item.semester}</p>
                      </div>
                      <button
                        className="text-red-600 hover:text-red-900 p-1"
                        onClick={() => deleteTimetableHandler(item._id)}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{item.day}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{item.time}</span>
                      </div>
                      <div className="flex items-center">
                        <FiUsers className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{item.facultyName || "No faculty assigned"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-10 flex flex-col items-center justify-center text-center rounded-md">
              <FiCalendar className="text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {searchTerm ? "No matching timetable entries found" : "No timetable entries available"}
              </h3>
              <p className="text-gray-500 max-w-md">
                {searchTerm
                  ? `No timetable entries matching "${searchTerm}" were found. Try a different search term.`
                  : "There are no timetable entries in the system yet. Add your first entry to get started."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Timetable;
