/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiUpload, FiBook, FiFile } from "react-icons/fi";
import Heading from "../../components/Heading";
import { AiOutlineClose } from "react-icons/ai";
import { BsCloudUpload } from "react-icons/bs";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { baseApiURL } from "../../baseUrl";
import { BiBookAlt } from "react-icons/bi";
import { MdTitle } from "react-icons/md";
const Material = () => {
  const { fullname } = useSelector((state) => state.userData);
  const [subject, setSubject] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [selected, setSelected] = useState({
    title: "",
    subject: "",
    faculty: fullname?.split(" ")[0] + " " + fullname?.split(" ")[2] || "",
  });

  useEffect(() => {
    setSubjectsLoading(true);
    toast.loading("Loading Subjects");
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((response) => {
        toast.dismiss();
        setSubjectsLoading(false);
        if (response.data.success) {
          setSubject(response.data.subject);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setSubjectsLoading(false);
        toast.dismiss();
        toast.error(error.message);
      });
  }, []);

  const addMaterialHandler = () => {
    // Validation checks
    if (!selected.title.trim()) {
      toast.error("Please enter a material title");
      return;
    }
    if (!selected.subject || selected.subject === "select") {
      toast.error("Please select a subject");
      return;
    }
    if (!file) {
      toast.error("Please upload a material file");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Adding Material");
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    const formData = new FormData();
    formData.append("title", selected.title);
    formData.append("subject", selected.subject);
    formData.append("faculty", selected.faculty);
    formData.append("type", "material");
    formData.append("material", file);
    
    axios
      .post(`${baseApiURL()}/material/addMaterial`, formData, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        setIsSubmitting(false);
        if (response.data.success) {
          toast.success(response.data.message);
          setSelected({
            title: "",
            subject: "",
            faculty: fullname?.split(" ")[0] + " " + fullname?.split(" ")[2] || "",
          });
          setFile(null);
          setFileName("");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setIsSubmitting(false);
        toast.dismiss();
        toast.error(error.response?.data?.message || "An error occurred while uploading material");
      });
  };
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-3 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
        <div className="flex items-center">
          <FiBook className="text-white text-xl sm:text-2xl mr-2 sm:mr-3" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Upload Material</h2>
        </div>
        <p className="text-blue-100 mt-1 sm:mt-2 pl-1 text-sm sm:text-base">Share educational resources with your students</p>
      </div>

      {subjectsLoading ? (
        <div className="w-full flex justify-center items-center h-48 sm:h-64">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 hover:shadow-md transition-all">
          <div className="flex items-center mb-4 sm:mb-6 pb-2 sm:pb-4 border-b border-gray-100">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-2 sm:mr-3"></div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Add New Material</h3>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <label htmlFor="title" className="text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2 flex items-center">
                <MdTitle className="mr-2 text-blue-600" /> Material Title
              </label>
              <input
                type="text"
                id="title"
                className="bg-gray-50 border border-gray-300 text-gray-900 py-2 sm:py-3 px-3 sm:px-4 rounded-md text-sm sm:text-base w-full focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={selected.title}
                placeholder="Enter material title"
                onChange={(e) =>
                  setSelected({ ...selected, title: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label htmlFor="subject" className="text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2 flex items-center">
                <BiBookAlt className="mr-2 text-blue-600" /> Material Subject
              </label>
              <select
                value={selected.subject}
                name="subject"
                id="subject"
                onChange={(e) =>
                  setSelected({ ...selected, subject: e.target.value })
                }
                className="bg-gray-50 border border-gray-300 text-gray-900 py-2 sm:py-3 px-3 sm:px-4 rounded-md text-sm sm:text-base w-full focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option defaultValue value="select">
                  Select Subject
                </option>
                {subject &&
                  subject.map((item) => {
                    return (
                      <option value={item.name} key={item.name}>
                        {item.name}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="mb-6">
              <label className="text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2 flex items-center">
                <FiFile className="mr-2 text-blue-600" /> Material File
              </label>
              
              {!fileName ? (
                <label
                  htmlFor="upload"
                  className="flex flex-col sm:flex-row items-center justify-center w-full px-3 sm:px-4 py-3 bg-gray-50 border border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-100 transition-all duration-300"
                >
                  <BsCloudUpload className="text-blue-500 text-xl mb-1 sm:mb-0 sm:mr-2" />
                  <span className="text-gray-600 text-sm sm:text-base text-center sm:text-left">Click to upload material</span>
                </label>
              ) : (
                <div className="flex items-center justify-between w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 border border-blue-300 rounded-md">
                  <div className="flex items-center flex-1 min-w-0">
                    <FiFile className="text-blue-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 truncate text-sm sm:text-base">{fileName}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setFile(null);
                      setFileName("");
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors duration-300 ml-2 flex-shrink-0"
                  >
                    <AiOutlineClose />
                  </button>
                </div>
              )}
              
              <input
                type="file"
                name="upload"
                id="upload"
                hidden
                onChange={handleFileChange}
              />
            </div>

            <div className="flex justify-center">
              <button
                className={`w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'} text-white text-sm sm:text-base font-medium rounded-md shadow-md transition-all duration-300`}
                onClick={addMaterialHandler}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" />
                    <span>Upload Material</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Material;
