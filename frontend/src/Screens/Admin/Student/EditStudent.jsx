import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { baseApiURL } from "../../../baseUrl";
import { API_URL } from "../../../config";
import { FiSearch, FiUpload, FiX } from "react-icons/fi";

const EditStudent = () => {
  const [file, setFile] = useState();
  const [branch, setBranch] = useState([]);
  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [data, setData] = useState({
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
  const [id, setId] = useState();
  
  const getBranchData = () => {
    setLoading(true);
    const headers = {
      "Content-Type": "application/json",
    };
    // Use API_URL as fallback if baseApiURL() is undefined
    const apiUrl = baseApiURL() || API_URL;
    console.log("Using API URL for branch fetch:", apiUrl);
    
    axios
      .get(`${apiUrl}/branch/getBranch`, { headers })
      .then((response) => {
        if (response.data.success) {
          setBranch(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch branch data");
        setLoading(false);
      });
  };

  useEffect(() => {
    getBranchData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewImage(imageUrl);
  };

  const updateStudentProfile = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!data.firstName || !data.email) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setLoading(true);
    toast.loading("Updating Student");
    
    const formData = new FormData();
    formData.append("enrollmentNo", data.enrollmentNo);
    formData.append("firstName", data.firstName);
    formData.append("middleName", data.middleName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("semester", data.semester);
    formData.append("branch", data.branch);
    formData.append("gender", data.gender);
    
    if (file) {
      formData.append("type", "profile");
      formData.append("profile", file);
    }
    
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    
    // Use API_URL as fallback if baseApiURL() is undefined
    const apiUrl = baseApiURL() || API_URL;
    console.log("Using API URL for updating student:", apiUrl);
    
    axios
      .put(`${apiUrl}/student/details/updateDetails/${id}`, formData, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          clearSearchHandler();
        } else {
          toast.error(response.data.message);
        }
        setLoading(false);
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || "An error occurred");
        setLoading(false);
      });
  };

  const searchStudentHandler = (e) => {
    e.preventDefault();
    
    if (!search) {
      toast.error("Please enter an Enrollment Number to search");
      return;
    }
    
    setSearchLoading(true);
    setSearchActive(true);
    toast.loading("Searching for Student");
    
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
          if (response.data.user.length === 0) {
            toast.error("No Student Found!");
            setSearchActive(false);
          } else {
            toast.success(response.data.message);
            setData({
              enrollmentNo: response.data.user[0].enrollmentNo,
              firstName: response.data.user[0].firstName,
              middleName: response.data.user[0].middleName,
              lastName: response.data.user[0].lastName,
              email: response.data.user[0].email,
              phoneNumber: response.data.user[0].phoneNumber,
              semester: response.data.user[0].semester,
              branch: response.data.user[0].branch,
              gender: response.data.user[0].gender,
              profile: response.data.user[0].profile,
            });
            setId(response.data.user[0]._id);
          }
        } else {
          toast.error(response.data?.message || "Error searching for student");
          setSearchActive(false);
        }
        setSearchLoading(false);
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || "An error occurred");
        console.error(error);
        setSearchLoading(false);
        setSearchActive(false);
      });
  };

  const clearSearchHandler = () => {
    setSearchActive(false);
    setSearch("");
    setId("");
    setPreviewImage("");
    setFile(null);
    setData({
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

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit Student Profile</h2>
      
      {/* Search Form */}
      <div className="mb-8">
        <form
          onSubmit={searchStudentHandler}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              className="w-full bg-blue-50 rounded-md border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-4 pr-12 leading-8 transition-colors duration-200 ease-in-out"
              placeholder="Enter Enrollment Number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FiSearch />
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex-1 sm:flex-none"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
            
            {searchActive && (
              <button
                type="button"
                onClick={clearSearchHandler}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-gray-700 font-medium transition-colors flex-1 sm:flex-none"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Edit Form */}
      {searchActive && (
        <form
          onSubmit={updateStudentProfile}
          className="w-full flex flex-wrap justify-between items-start"
        >
          {/* Profile Image Upload */}
          <div className="w-full flex justify-center items-center mb-8">
            <div className="relative">
              {previewImage ? (
                <div className="relative">
                  <img 
                    src={previewImage} 
                    alt="student" 
                    className="h-36 w-36 object-cover rounded-full border-4 border-blue-100"
                  />
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
              ) : data.profile ? (
                <div className="relative">
                  <img 
                    src={`${process.env.REACT_APP_MEDIA_LINK || baseApiURL() || API_URL}/${data.profile}`} 
                    alt="student" 
                    className="h-36 w-36 object-cover rounded-full border-4 border-blue-100"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=Student";
                    }}
                  />
                </div>
              ) : (
                <div className="h-36 w-36 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              
              <label 
                htmlFor="file"
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors"
              >
                <FiUpload />
              </label>
              <input
                hidden
                type="file"
                id="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          {/* Student Information */}
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="enrollmentNo" className="block text-sm font-medium text-gray-700 mb-1">
              Enrollment Number
            </label>
            <input
              type="text"
              id="enrollmentNo"
              value={data.enrollmentNo}
              disabled
              className="w-full bg-gray-100 rounded border border-gray-300 text-base outline-none text-gray-700 py-2 px-3 leading-8 cursor-not-allowed"
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={data.firstName}
              onChange={(e) => setData({ ...data, firstName: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
              required
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name
            </label>
            <input
              type="text"
              id="middleName"
              value={data.middleName}
              onChange={(e) => setData({ ...data, middleName: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={data.lastName}
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
              required
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="number"
              id="phoneNumber"
              value={data.phoneNumber}
              onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              disabled
              id="semester"
              value={data.semester}
              className="w-full bg-gray-100 rounded border border-gray-300 text-base outline-none text-gray-700 py-2 px-3 leading-8 cursor-not-allowed"
            >
              <option value="">-- Select --</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">3rd Semester</option>
              <option value="4">4th Semester</option>
              <option value="5">5th Semester</option>
              <option value="6">6th Semester</option>
              <option value="7">7th Semester</option>
              <option value="8">8th Semester</option>
            </select>
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              disabled
              id="branch"
              value={data.branch}
              className="w-full bg-gray-100 rounded border border-gray-300 text-base outline-none text-gray-700 py-2 px-3 leading-8 cursor-not-allowed"
            >
              <option value="">-- Select --</option>
              {branch?.map((branch) => (
                <option value={branch.name} key={branch.name}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              value={data.gender}
              onChange={(e) => setData({ ...data, gender: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            >
              <option value="">-- Select --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div className="w-full flex justify-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-md text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Student"}
            </button>
          </div>
        </form>
      )}
      
      {/* Empty State */}
      {!searchActive && (
        <div className="bg-gray-50 p-10 flex flex-col items-center justify-center text-center rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Search for a Student
          </h3>
          <p className="text-gray-500 max-w-md">
            Enter an Enrollment Number in the search box above to find and edit a student's profile.
          </p>
        </div>
      )}
    </div>
  );
};

export default EditStudent;
