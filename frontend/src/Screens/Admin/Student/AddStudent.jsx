import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { baseApiURL } from "../../../baseUrl";
import { API_URL } from "../../../config";
import { FiUpload, FiX } from "react-icons/fi";

const AddStudent = () => {
  const [file, setFile] = useState();
  const [branch, setBranch] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
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
  });

  const getBranchData = () => {
    setLoading(true);
    const headers = {
      "Content-Type": "application/json",
    };
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

  const addStudentProfile = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!data.enrollmentNo || !data.firstName || !data.email || !data.branch || !data.semester) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    toast.loading("Adding Student");

    const headers = {
      "Content-Type": "multipart/form-data",
    };

    const apiUrl = baseApiURL() || API_URL;
    console.log("Using API URL for adding student:", apiUrl);

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
    formData.append("type", "profile");

    if (file) {
      formData.append("profile", file);
    }

    axios
      .post(`${apiUrl}/student/details/addDetails`, formData, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          axios
            .post(`${apiUrl}/student/auth/register`, {
              loginid: data.enrollmentNo,
              password: data.enrollmentNo,
            })
            .then((response) => {
              toast.dismiss();
              if (response.data.success) {
                toast.success(response.data.message);
                setFile(null);
                setPreviewImage("");
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
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Add New Student</h2>

      <form
        onSubmit={addStudentProfile}
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
            ) : (
              <div className="h-36 w-36 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
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
            Enrollment Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="enrollmentNo"
            value={data.enrollmentNo}
            onChange={(e) => setData({ ...data, enrollmentNo: e.target.value })}
            className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            required
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
            Semester <span className="text-red-500">*</span>
          </label>
          <select
            id="semester"
            value={data.semester}
            onChange={(e) => setData({ ...data, semester: e.target.value })}
            className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            required
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
            Branch <span className="text-red-500">*</span>
          </label>
          <select
            id="branch"
            value={data.branch}
            onChange={(e) => setData({ ...data, branch: e.target.value })}
            className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
            required
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
            {loading ? "Adding..." : "Add New Student"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
