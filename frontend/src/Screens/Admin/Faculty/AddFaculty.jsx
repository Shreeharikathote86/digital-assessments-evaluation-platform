import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { baseApiURL } from "../../../baseUrl";
import { FiUpload, FiX } from "react-icons/fi";

const AddFaculty = () => {
  const [file, setFile] = useState();
  const [branch, setBranch] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
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
  });

  // Fetch branch data when component mounts
  useEffect(() => {
    const getBranch = async () => {
      try {
        const { data } = await axios.get(`${baseApiURL()}/branch/getBranch`);
        if (data.success) {
          setBranch(data.branches);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getBranch();
  }, []);

  // Handle file selection for profile image
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewImage(imageUrl);
  };

  // Add new faculty
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First create faculty credentials
      const credentialResponse = await axios.post(
        `${baseApiURL()}/faculty/auth/register`,
        {
          loginid: data.employeeId,
          password: data.employeeId // Default password is the same as employee ID
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      if (!credentialResponse.data.success) {
        toast.error(credentialResponse.data.message);
        setLoading(false);
        return;
      }
      
      // Then create faculty details
      const formData = new FormData();
      formData.append("employeeId", data.employeeId);
      formData.append("firstName", data.firstName);
      formData.append("middleName", data.middleName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("department", data.department);
      formData.append("gender", data.gender);
      formData.append("experience", data.experience);
      formData.append("post", data.post);
      formData.append("type", "profile"); // This is needed for multer to correctly handle the file
      
      if (file) {
        formData.append("profile", file);
      }
      
      const { data: responseData } = await axios.post(
        `${baseApiURL()}/faculty/details/addDetails`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      if (responseData.success) {
        toast.success("Faculty added successfully!");
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
        });
        setFile(null);
        setPreviewImage("");
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full flex flex-wrap justify-between items-start"
    >
      <div className="w-full md:w-[48%] mb-4">
        <label htmlFor="employeeId" className="leading-7 text-sm font-medium">
          Employee ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="employeeId"
          className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
          value={data.employeeId}
          onChange={(e) => setData({ ...data, employeeId: e.target.value })}
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
        <select
          id="department"
          className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
          value={data.department}
          onChange={(e) => setData({ ...data, department: e.target.value })}
          required
        >
          <option value="">Select Department</option>
          {branch.map((item) => (
            <option key={item._id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="w-full md:w-[48%] mb-4">
        <label htmlFor="gender" className="leading-7 text-sm font-medium">
          Gender
        </label>
        <select
          id="gender"
          className="w-full bg-blue-50 rounded border focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
          value={data.gender}
          onChange={(e) => setData({ ...data, gender: e.target.value })}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
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
      
      <div className="w-full flex justify-center mt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-md text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Add Faculty"}
        </button>
      </div>
    </form>
  );
};

export default AddFaculty;
