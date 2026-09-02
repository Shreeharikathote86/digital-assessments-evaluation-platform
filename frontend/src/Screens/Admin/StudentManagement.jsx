import React, { useState, useEffect } from "react";
import Heading from "../../components/Heading";
import { baseApiURL } from "../../baseUrl";
import { API_URL } from "../../config";
import axios from "axios";
import toast from "react-hot-toast";
import { FiSearch, FiUpload, FiX, FiUser, FiEdit, FiEdit2, FiTrash2 } from "react-icons/fi";

const StudentManagement = () => {
  const [selected, setSelected] = useState("add");
  const [branch, setBranch] = useState([]);
  const [file, setFile] = useState();
  const [previewImage, setPreviewImage] = useState("");
  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [addData, setAddData] = useState({
    enrollmentNo: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    semester: "",
    branch: "",
    gender: "",
  });
  const [editData, setEditData] = useState({
    enrollmentNo: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    semester: "",
    branch: "",
    gender: "",
    profile: "",
  });
  const [editFile, setEditFile] = useState();
  const [editPreviewImage, setEditPreviewImage] = useState("");
  const [filter, setFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [students, setStudents] = useState([]);



  // Fetch branch data and students when component mounts
  useEffect(() => {
    getBranchData();
    fetchStudents();
  }, []);

  // Get all branches for dropdowns
  const getBranchData = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/branch/getBranch`, { headers })
      .then((response) => {
        if (response.data.success) {
          setBranch(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch branch data");
      });
  };

  // Fetch students data when component mounts
  const fetchStudents = async () => {
    try {
      // Use API_URL as fallback if baseApiURL() is undefined
      const apiUrl = baseApiURL() || API_URL;
      console.log("Using API URL for student fetch:", apiUrl);
      
      // The backend doesn't have a /student/getStudents endpoint
      // It has a /student/details/getDetails endpoint that accepts POST
      const { data } = await axios.post(
        `${apiUrl}/student/details/getDetails`, 
        {}, // Empty object to get all students
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      
      if (data.success) {
        console.log("Students fetched successfully:", data.user);
        if (Array.isArray(data.user)) {
          setStudents(data.user); // Note: backend returns 'user' array, not 'students'
        } else {
          console.warn("Expected array of students but got:", typeof data.user);
          setStudents([]); // Set empty array if data.user is not an array
        }
      } else {
        toast.error(data.message || "Failed to fetch students");
        console.error("Error response from server:", data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students data");
    }
  };

  // Handle file selection for profile image
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewImage(imageUrl);
  };

  // Handle file selection for edit profile image
  const handleEditFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setEditFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setEditPreviewImage(imageUrl);
  };

  // Add new student
  const addStudentHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.loading("Adding Student");
    
    // Validate required fields
    if (!addData.enrollmentNo || !addData.firstName || !addData.email || !addData.branch || !addData.semester) {
      toast.dismiss();
      toast.error("Please fill all required fields");
      setLoading(false);
      return;
    }
    
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    const formData = new FormData();
    formData.append("enrollmentNo", addData.enrollmentNo);
    formData.append("firstName", addData.firstName);
    formData.append("middleName", addData.middleName);
    formData.append("lastName", addData.lastName);
    formData.append("email", addData.email);
    formData.append("phoneNumber", addData.phoneNumber);
    formData.append("semester", addData.semester);
    formData.append("branch", addData.branch);
    formData.append("gender", addData.gender);
    formData.append("type", "profile"); // This is needed for Cloudinary to correctly handle the file
    
    // Create login credentials first
    try {
      // Validate enrollment number
      if (!addData.enrollmentNo) {
        toast.dismiss();
        toast.error("Enrollment number is required");
        setLoading(false);
        return;
      }
      
      console.log('Sending student credential data:', {
        loginid: addData.enrollmentNo.toString(),
        password: addData.enrollmentNo.toString()
      });
      
      try {
        const credentialResponse = await axios.post(
          `${baseApiURL()}/student/auth/register`, 
          {
            loginid: addData.enrollmentNo.toString(),
            password: addData.enrollmentNo.toString(),
          },
          {
            headers: { "Content-Type": "application/json" }
          }
        );
        
        console.log('Student credential response:', credentialResponse.data);
        
        if (!credentialResponse.data.success) {
          toast.dismiss();
          toast.error(credentialResponse.data.message || 'Failed to create student credentials');
          setLoading(false);
          return;
        }
      
      } catch (error) {
        console.error('Error creating student credentials:', error);
        console.error('Error details:', error.response?.data || 'No response data');
        toast.dismiss();
        toast.error(error.response?.data?.message || 'Failed to create student credentials');
        setLoading(false);
        return;
      }
      
      // Now add the profile picture if available
      if (file) {
        formData.append("profile", file);
      }
      
      // Now add student details
      const response = await axios.post(
        `${baseApiURL()}/student/details/addDetails`, 
        formData, 
        { headers: headers }
      );
      
      toast.dismiss();
      
      if (response.data.success) {
        toast.success("Student added successfully!");
        // Reset form
        setFile(null);
        setPreviewImage("");
        setAddData({
          enrollmentNo: "",
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          semester: "",
          branch: "",
          gender: "",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error("Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  // Search for a student by enrollment number
  const searchStudentHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    toast.loading("Searching Student");
    
    if (!search) {
      toast.dismiss();
      toast.error("Please enter enrollment number");
      setLoading(false);
      return;
    }
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    // Use API_URL as fallback if baseApiURL() is undefined
    const apiUrl = baseApiURL() || API_URL;
    console.log("Using API URL for student search:", apiUrl);
    
    axios
      .post(
        `${apiUrl}/student/details/getDetails`,
        { enrollmentNo: search },
        { headers }
      )
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          // Check if user array exists and has at least one item
          if (response.data.user && response.data.user.length > 0) {
            const student = response.data.user[0]; // Get the first student from the array
            setSearchActive(true);
            setStudentId(student._id);
            setEditData({
              enrollmentNo: student.enrollmentNo || "",
              firstName: student.firstName || "",
              middleName: student.middleName || "",
              lastName: student.lastName || "",
              email: student.email || "",
              phoneNumber: student.phoneNumber || "",
              semester: student.semester || "",
              branch: student.branch || "",
              gender: student.gender || "",
              profile: student.profile || "",
            });
            toast.success("Student found successfully");
          } else {
            toast.error("No student found with this enrollment number");
            setSearchActive(false);
          }
        } else {
          toast.error(response.data.message);
          setSearchActive(false);
        }
        setLoading(false);
      })
      .catch((error) => {
        toast.dismiss();
        console.error("Error searching for student:", error);
        toast.error("Failed to search student");
        setLoading(false);
        setSearchActive(false);
      });
  };

  // Update student information
  const updateStudentHandler = (e) => {
    e.preventDefault();
    if (!studentId) {
      toast.error("No student selected for update");
      return;
    }
    
    setLoading(true);
    toast.loading("Updating Student");
    
    const formData = new FormData();
    formData.append("enrollmentNo", editData.enrollmentNo);
    formData.append("firstName", editData.firstName);
    formData.append("middleName", editData.middleName);
    formData.append("lastName", editData.lastName);
    formData.append("email", editData.email);
    formData.append("phoneNumber", editData.phoneNumber);
    formData.append("semester", editData.semester);
    formData.append("branch", editData.branch);
    formData.append("gender", editData.gender);
    
    if (editFile) {
      formData.append("type", "profile");
      formData.append("profile", editFile);
    }
    
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    
    // Use API_URL as fallback if baseApiURL() is undefined
    const apiUrl = baseApiURL() || API_URL;
    console.log("Using API URL for updating student:", apiUrl);
    console.log("Student ID for update:", studentId);
    
    axios
      .put(`${apiUrl}/student/details/updateDetails/${studentId}`, formData, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message || "Student updated successfully");
          fetchStudents(); // Refresh the student list
          clearSearchHandler();
        } else {
          toast.error(response.data.message || "Failed to update student");
        }
        setLoading(false);
      })
      .catch((error) => {
        toast.dismiss();
        console.error("Error updating student:", error);
        toast.error(error.response?.data?.message || "Failed to update student");
        setLoading(false);
      });
  };

  // Clear search and reset edit form
  const clearSearchHandler = () => {
    setSearch("");
    setSearchActive(false);
    setStudentId("");
    setEditFile(null);
    setEditPreviewImage("");
    setEditData({
      enrollmentNo: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      semester: "",
      branch: "",
      gender: "",
      profile: "",
    });
  };

  // Delete student handler
  const deleteHandler = async (id) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this student?");
      if (!confirm) return;
      
      setLoading(true);
      const { data } = await axios.delete(
        `${baseApiURL()}/student/deleteStudent/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (data.success) {
        toast.success(data.message);
        fetchStudents();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search and semester filter
  const filteredStudents = students.filter((student) => {
    if (!student) return false;
    
    // Make sure filter is a string
    const searchTerm = filter ? filter.toLowerCase() : '';
    
    // Add null/undefined checks and ensure values are strings before calling toLowerCase()
    const matchesSearch = 
      !filter || filter === "" || 
      (student.firstName && student.firstName.toString().toLowerCase().includes(searchTerm)) ||
      (student.lastName && student.lastName.toString().toLowerCase().includes(searchTerm)) ||
      (student.enrollmentNo && student.enrollmentNo.toString().toLowerCase().includes(searchTerm)) ||
      (student.email && student.email.toString().toLowerCase().includes(searchTerm));
    
    const matchesSemester = 
      !semesterFilter || semesterFilter === "" || 
      (student.semester && student.semester.toString() === semesterFilter.toString());
    
    return matchesSearch && matchesSemester;
  });

  return (
    <div className="w-full mx-auto mt-10 flex justify-center items-start flex-col mb-10">
      {/* Header with tab selection */}
      <div className="flex justify-between items-center w-full md:flex-row flex-col">
        <Heading title="Student Management" />
        <div className="flex justify-end items-center w-full md:w-auto">
          <button
            className={`${
              selected === "add" && "border-b-2 "
            }border-blue-500 px-3 sm:px-4 py-2 text-black rounded-sm mr-4 text-sm sm:text-base transition-all hover:bg-blue-50`}
            onClick={() => setSelected("add")}
          >
            Add Student
          </button>
          <button
            className={`${
              selected === "edit" && "border-b-2 "
            }border-blue-500 px-3 sm:px-4 py-2 text-black rounded-sm text-sm sm:text-base transition-all hover:bg-blue-50`}
            onClick={() => setSelected("edit")}
          >
            Edit Student
          </button>
        </div>
      </div>

      {/* Add Student Form */}
      {selected === "add" && (
        <div className="w-full mt-6">
          <form
            className="w-full flex flex-wrap justify-between items-start"
            onSubmit={addStudentHandler}
          >
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="enrollmentNo" className="leading-7 text-sm font-medium">
                Enrollment Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="enrollmentNo"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={addData.enrollmentNo}
                onChange={(e) =>
                  setAddData({ ...addData, enrollmentNo: e.target.value })
                }
                required
              />
            </div>
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="firstName" className="leading-7 text-sm font-medium">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={addData.firstName}
                onChange={(e) =>
                  setAddData({ ...addData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="middleName" className="leading-7 text-sm font-medium">
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={addData.middleName}
                onChange={(e) =>
                  setAddData({ ...addData, middleName: e.target.value })
                }
              />
            </div>
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="lastName" className="leading-7 text-sm font-medium">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={addData.lastName}
                onChange={(e) =>
                  setAddData({ ...addData, lastName: e.target.value })
                }
              />
            </div>
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="email" className="leading-7 text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={addData.email}
                onChange={(e) =>
                  setAddData({ ...addData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="phoneNumber" className="leading-7 text-sm font-medium">
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={addData.phoneNumber}
                onChange={(e) =>
                  setAddData({ ...addData, phoneNumber: e.target.value })
                }
              />
            </div>
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="semester" className="leading-7 text-sm font-medium">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                id="semester"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={addData.semester}
                onChange={(e) =>
                  setAddData({ ...addData, semester: e.target.value })
                }
                required
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="branch" className="leading-7 text-sm font-medium">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                id="branch"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={addData.branch}
                onChange={(e) =>
                  setAddData({ ...addData, branch: e.target.value })
                }
                required
              >
                <option value="">Select Branch</option>
                {branch.map((item) => {
                  return (
                    <option key={item._id} value={item.name}>
                      {item.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="gender" className="leading-7 text-sm font-medium">
                Gender
              </label>
              <select
                id="gender"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                value={addData.gender}
                onChange={(e) =>
                  setAddData({ ...addData, gender: e.target.value })
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="w-full md:w-[48%] mb-4">
              <label htmlFor="file" className="leading-7 text-sm font-medium">
                Profile Picture
              </label>
              <label
                htmlFor="file"
                className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out flex items-center justify-center cursor-pointer hover:bg-blue-100"
              >
                Upload Image
                <span className="ml-2">
                  <FiUpload />
                </span>
              </label>
              <input
                hidden
                type="file"
                id="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            {/* Profile Image Preview */}
            {previewImage && (
              <div className="w-full flex justify-center items-center my-4">
                <div className="relative">
                  <img src={previewImage} alt="student" className="h-36 w-36 object-cover rounded-full" />
                  <button 
                    type="button"
                    onClick={() => {
                      setPreviewImage("");
                      setFile(null);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            )}
            
            <div className="w-full flex justify-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-md text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Add Student"}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Edit Student Form */}
      {selected === "edit" && (
        <div className="w-full mt-6">
          {/* Search Form */}
          <form 
            className="w-full md:w-1/2 mx-auto mb-8 flex flex-col md:flex-row items-center"
            onSubmit={searchStudentHandler}
          >
            <div className="w-full md:flex-1 mb-4 md:mb-0 md:mr-4">
              <label htmlFor="search" className="leading-7 text-sm font-medium sr-only">
                Search by Enrollment Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by enrollment number"
                  className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 pl-10 pr-3 leading-8 transition-colors duration-200 ease-in-out"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Searching..." : "Search"}
              </button>
              {searchActive && (
                <button
                  type="button"
                  onClick={clearSearchHandler}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-gray-700 font-medium transition-colors text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
          
          {/* Edit Form */}
          {searchActive ? (
            <form
              className="w-full flex flex-wrap justify-between items-start"
              onSubmit={updateStudentHandler}
            >
              <div className="w-full md:w-[48%] mb-4">
                <label htmlFor="enrollmentNo" className="leading-7 text-sm font-medium">
                  Enrollment Number
                </label>
                <input
                  type="text"
                  id="enrollmentNo"
                  className="w-full bg-gray-100 rounded border text-base outline-none text-gray-700 py-2 px-3 leading-8 cursor-not-allowed"
                  value={editData.enrollmentNo}
                  disabled
                />
              </div>
              <div className="w-full md:w-[48%] mb-4">
                <label htmlFor="firstName" className="leading-7 text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  value={editData.firstName}
                  onChange={(e) =>
                    setEditData({ ...editData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="w-full md:w-[48%] mb-4">
                <label htmlFor="middleName" className="leading-7 text-sm font-medium">
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middleName"
                  className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  value={editData.middleName}
                  onChange={(e) =>
                    setEditData({ ...editData, middleName: e.target.value })
                  }
                />
              </div>
              <div className="w-full md:w-[48%] mb-4">
                <label htmlFor="lastName" className="leading-7 text-sm font-medium">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  value={editData.lastName}
                  onChange={(e) =>
                    setEditData({ ...editData, lastName: e.target.value })
                  }
                />
              </div>
              <div className="w-full md:w-[48%] mb-4">
                <label htmlFor="email" className="leading-7 text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="w-full md:w-[48%] mb-4">
                <label htmlFor="phoneNumber" className="leading-7 text-sm font-medium">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  value={editData.phoneNumber}
                  onChange={(e) =>
                    setEditData({ ...editData, phoneNumber: e.target.value })
                  }
                />
              </div>
              <div className="w-full md:w-[48%] mb-4">
                <label htmlFor="semester" className="leading-7 text-sm font-medium">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  id="semester"
                  className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  value={editData.semester}
                  onChange={(e) =>
                    setEditData({ ...editData, semester: e.target.value })
                  }
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
              <div className="w-full md:w-[48%] mb-4">
                <label htmlFor="branch" className="leading-7 text-sm font-medium">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  id="branch"
                  className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  value={editData.branch}
                  onChange={(e) =>
                    setEditData({ ...editData, branch: e.target.value })
                  }
                  required
                >
                  <option value="">Select Branch</option>
                  {branch.map((item) => {
                    return (
                      <option key={item._id} value={item.name}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="w-full md:w-[48%] mb-4">
                <label htmlFor="gender" className="leading-7 text-sm font-medium">
                  Gender
                </label>
                <select
                  id="gender"
                  className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  value={editData.gender}
                  onChange={(e) =>
                    setEditData({ ...editData, gender: e.target.value })
                  }
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="w-full md:w-[48%] mb-4">
                <label htmlFor="editFile" className="leading-7 text-sm font-medium">
                  Update Profile Picture
                </label>
                <label
                  htmlFor="editFile"
                  className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out flex items-center justify-center cursor-pointer hover:bg-blue-100"
                >
                  Upload New Image
                  <span className="ml-2">
                    <FiUpload />
                  </span>
                </label>
                <input
                  hidden
                  type="file"
                  id="editFile"
                  accept="image/*"
                  onChange={handleEditFileChange}
                />
              </div>
              
              {/* Edit Profile Image Preview */}
              {editPreviewImage ? (
                <div className="w-full flex justify-center items-center my-4">
                  <div className="relative">
                    <img src={editPreviewImage} alt="student" className="h-36 w-36 object-cover rounded-full" />
                    <button 
                      type="button"
                      onClick={() => {
                        setEditPreviewImage("");
                        setEditFile(null);
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              ) : editData.profile ? (
                <div className="w-full flex justify-center items-center my-4">
                  <div className="relative">
                    <img 
                      src={`${baseApiURL() || API_URL}/media/${editData.profile}`} 
                      alt="student" 
                      className="h-36 w-36 object-cover rounded-full border-4 border-blue-100"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </div>
                </div>
              ) : null}
              
              <div className="w-full flex justify-center mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-md text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Student"}
                </button>
              </div>
            </form>
          ) : (
            <div className="w-full flex justify-center items-center">
              <p className="text-gray-500 text-center">
                Search for a student by enrollment number to edit their details
              </p>
            </div>
          )}
        </div>
      )}

      {/* Student List */}
      <div className="w-full mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold">All Students</h2>
          <div className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            >
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>
        </div>
        
        {/* Student Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Enrollment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={student.profile 
                              ? student.profile.includes('cloudinary.com') 
                                ? student.profile 
                                : `${baseApiURL() || API_URL}/media/${student.profile}` 
                              : "https://via.placeholder.com/150"}
                            alt={student.firstName}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/150";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.middleName} {student.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900">{student.enrollmentNo}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">{student.email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Sem {student.semester}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-500">{student.branch}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSearch(student.enrollmentNo);
                            setSelected("edit");
                            searchStudentHandler({ preventDefault: () => {} });
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteHandler(student._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile View for Students (Only visible on extra small screens) */}
        <div className="sm:hidden mt-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div key={student._id} className="bg-white rounded-lg shadow mb-4 p-4">
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 flex-shrink-0">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={student.profile 
                        ? `${baseApiURL() || API_URL}/media/${student.profile}` 
                        : "https://via.placeholder.com/150"}
                      alt={student.firstName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {student.firstName} {student.middleName} {student.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{student.enrollmentNo}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="font-medium text-gray-500">Email:</span>
                    <div className="truncate">{student.email}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Branch:</span>
                    <div>{student.branch}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Semester:</span>
                    <div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Sem {student.semester}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSearch(student.enrollmentNo);
                      setSelected("edit");
                      searchStudentHandler({ preventDefault: () => {} });
                    }}
                    className="text-blue-600 hover:text-blue-900 p-2"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteHandler(student._id)}
                    className="text-red-600 hover:text-red-900 p-2"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
              No students found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
