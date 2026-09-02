import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { baseApiURL } from "../../../baseUrl";
import { FiUpload, FiX } from "react-icons/fi";

const AddAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState();
  const [data, setData] = useState({
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
  });
  const [previewImage, setPreviewImage] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewImage(imageUrl);
  };

  const addAdminProfile = (e) => {
    e.preventDefault();
    
    if (!data.employeeId || !data.firstName || !data.lastName || !data.email || !data.phoneNumber || !data.gender) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setLoading(true);
    toast.loading("Adding Admin");
    
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
    formData.append("gender", data.gender);
    formData.append("type", "profile");
    
    if (file) {
      formData.append("profile", file);
    }
    
    axios
      .post(`${baseApiURL()}/admin/details/addDetails`, formData, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          axios
            .post(`${baseApiURL()}/Admin/auth/register`, {
              loginid: data.employeeId,
              password: data.employeeId,
            })
            .then((response) => {
              toast.dismiss();
              if (response.data.success) {
                toast.success(response.data.message);
                setFile(null);
                setPreviewImage("");
                setData({
                  employeeId: "",
                  firstName: "",
                  middleName: "",
                  lastName: "",
                  email: "",
                  phoneNumber: "",
                  gender: "",
                });
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
        } else {
          toast.error(response.data.message);
          setLoading(false);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response?.data?.message || "An error occurred");
        setLoading(false);
      });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Admin</h2>
      
      <form
        onSubmit={addAdminProfile}
        className="w-full flex flex-wrap justify-between items-start"
      >
        {/* Profile Image Upload */}
        <div className="w-full flex justify-center items-center mb-8">
          <div className="relative">
            {previewImage ? (
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="admin" 
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
        
        {/* Personal Information */}
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
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={data.lastName}
            onChange={(e) => setData({ ...data, lastName: e.target.value })}
            className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            required
          />
        </div>
        
        <div className="w-full md:w-[48%] mb-4">
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="employeeId"
            value={data.employeeId}
            onChange={(e) => setData({ ...data, employeeId: e.target.value })}
            className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            required
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
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="phoneNumber"
            value={data.phoneNumber}
            onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
            className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            required
          />
        </div>
        
        <div className="w-full md:w-[48%] mb-4">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            value={data.gender}
            onChange={(e) => setData({ ...data, gender: e.target.value })}
            className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            required
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
            {loading ? "Adding..." : "Add New Admin"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAdmin;
