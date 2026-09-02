import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { baseApiURL } from "../../../baseUrl";
import { FiSearch, FiUpload, FiX } from "react-icons/fi";

const EditFaculty = () => {
  const [file, setFile] = useState();
  const [searchActive, setSearchActive] = useState(false);
  const [data, setData] = useState({
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    department: "",
    gender: "",
    experience: "",
    post: "",
    profile: "",
  });
  const [id, setId] = useState();
  const [search, setSearch] = useState();
  const [previewImage, setPreviewImage] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewImage(imageUrl);
  };

  const updateFacultyProfile = (e) => {
    e.preventDefault();
    toast.loading("Updating Faculty");
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    const formData = new FormData();
    formData.append("employeeId", data.employeeId);
    formData.append("firstName", data.firstName);
    formData.append("middleName", data.middleName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("department", data.department);
    formData.append("experience", data.experience);
    formData.append("gender", data.gender);
    formData.append("post", data.post);
    if (file) {
      formData.append("type", "profile");
      formData.append("profile", file);
    }
    axios
      .put(`${baseApiURL()}/faculty/details/updateDetails/${id}`, formData, {
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
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  const searchFacultyHandler = (e) => {
    setSearchActive(true);
    e.preventDefault();
    toast.loading("Getting Faculty");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(
        `${baseApiURL()}/faculty/details/getDetails`,
        { employeeId: search },
        { headers }
      )
      .then((response) => {
        toast.dismiss();
        if (response.data.user.length === 0) {
          toast.error("No Faculty Found!");
        } else {
          toast.success(response.data.message);
          setId(response.data.user[0]._id);
          setData({
            employeeId: response.data.user[0].employeeId,
            firstName: response.data.user[0].firstName,
            middleName: response.data.user[0].middleName,
            lastName: response.data.user[0].lastName,
            email: response.data.user[0].email,
            phoneNumber: response.data.user[0].phoneNumber,
            post: response.data.user[0].post,
            department: response.data.user[0].department,
            gender: response.data.user[0].gender,
            profile: response.data.user[0].profile,
            experience: response.data.user[0].experience,
          });
        }
      })
      .catch((error) => {
        toast.dismiss();
        if (error?.response?.data) toast.error(error.response.data.message);
        console.error(error);
      });
  };

  const clearSearchHandler = () => {
    setSearchActive(false);
    setSearch("");
    setId("");
    setPreviewImage();
    setData({
      employeeId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      department: "",
      gender: "",
      experience: "",
      post: "",
      profile: "",
    });
  };

  return (
    <div className="w-full">
      {/* Search Form */}
      <form 
        className="w-full md:w-1/2 mx-auto mb-8 flex flex-col md:flex-row items-center"
        onSubmit={searchFacultyHandler}
      >
        <div className="w-full md:flex-1 mb-4 md:mb-0 md:mr-4">
          <label htmlFor="search" className="leading-7 text-sm font-medium sr-only">
            Search by Employee ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              placeholder="Search by employee ID"
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 pl-10 pr-3 leading-8 transition-colors duration-200 ease-in-out"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white font-medium transition-colors text-sm"
          >
            Search
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
      {search && id && (
        <form 
          onSubmit={updateFacultyProfile}
          className="w-full flex flex-wrap justify-between items-start"
        >
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="employeeId" className="leading-7 text-sm font-medium">
              Employee ID
            </label>
            <input
              type="text"
              id="employeeId"
              className="w-full bg-gray-100 rounded border text-base outline-none text-gray-700 py-2 px-3 leading-8 cursor-not-allowed"
              value={data.employeeId}
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
              value={data.firstName}
              onChange={(e) => setData({ ...data, firstName: e.target.value })}
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
              value={data.middleName}
              onChange={(e) => setData({ ...data, middleName: e.target.value })}
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
              value={data.lastName}
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
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
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
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
              value={data.phoneNumber}
              onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="department" className="leading-7 text-sm font-medium">
              Department <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="department"
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
              value={data.department}
              onChange={(e) => setData({ ...data, department: e.target.value })}
              required
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="gender" className="leading-7 text-sm font-medium">
              Gender
            </label>
            <input
              type="text"
              id="gender"
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
              value={data.gender}
              onChange={(e) => setData({ ...data, gender: e.target.value })}
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="experience" className="leading-7 text-sm font-medium">
              Experience (years) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="experience"
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
              value={data.experience}
              onChange={(e) => setData({ ...data, experience: e.target.value })}
              required
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="post" className="leading-7 text-sm font-medium">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="post"
              className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
              value={data.post}
              onChange={(e) => setData({ ...data, post: e.target.value })}
              required
            />
          </div>
          
          <div className="w-full md:w-[48%] mb-4">
            <label htmlFor="file" className="leading-7 text-sm font-medium">
              Update Profile Picture
            </label>
            <label
              htmlFor="file"
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
              id="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          {/* Profile Image Preview */}
          {previewImage && (
            <div className="w-full flex justify-center items-center my-4">
              <div className="relative">
                <img src={previewImage} alt="faculty" className="h-36 w-36 object-cover rounded-full" />
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
          
          {!previewImage && data.profile && (
            <div className="w-full flex justify-center items-center my-4">
              <div className="relative">
                <img src={process.env.REACT_APP_MEDIA_LINK + "/" + data.profile} alt="faculty" className="h-36 w-36 object-cover rounded-full" />
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
              className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-md text-white font-medium transition-colors text-sm"
            >
              Update Faculty
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditFaculty;
