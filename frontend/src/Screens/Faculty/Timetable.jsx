import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiUpload, FiCalendar, FiFile } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { BsBuilding, BsFileEarmarkPdf } from "react-icons/bs";
import { IoSchoolOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import { baseApiURL } from "../../baseUrl";
const Timetable = () => {
  const [addselected, setAddSelected] = useState({
    branch: "",
    semester: "",
  });
  const [file, setFile] = useState();
  const [branch, setBranch] = useState();
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(true);

  useEffect(() => {
    getBranchData();
  }, []);

  const getBranchData = () => {
    setBranchLoading(true);
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/branch/getBranch`, { headers })
      .then((response) => {
        setBranchLoading(false);
        if (response.data.success) {
          setBranch(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setBranchLoading(false);
        console.error(error);
        toast.error(error.message);
      });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(imageUrl);
  };

  const addTimetableHandler = () => {
    // Validate inputs
    if (!addselected.branch || !addselected.semester || !file) {
      toast.error("Please select branch, semester, and upload a timetable file");
      return;
    }
    
    setLoading(true);
    toast.loading("Adding Timetable");
    const headers = {
      "Content-Type": "multipart/form-data",
    };
    const formData = new FormData();
    formData.append("branch", addselected.branch);
    formData.append("semester", addselected.semester);
    formData.append("type", "timetable");
    formData.append("timetable", file);
    
    axios
      .post(`${baseApiURL()}/timetable/addTimetable`, formData, {
        headers: headers,
      })
      .then((response) => {
        setLoading(false);
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setAddSelected({
            branch: "",
            semester: "",
          });
          setFile("");
          setPreviewUrl("");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.dismiss();
        console.log("File error", error);
        toast.error(error.response?.data?.message || "Failed to upload timetable");
      });
  };
  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-3 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
        <div className="flex items-center">
          <FiCalendar className="text-white text-xl sm:text-2xl mr-2 sm:mr-3" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Timetable Management</h2>
        </div>
        <p className="text-blue-100 mt-1 sm:mt-2 pl-1 text-sm sm:text-base">Upload and manage class timetables for different branches and semesters</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 hover:shadow-md transition-all">
        <div className="flex items-center mb-4 sm:mb-6 pb-2 sm:pb-4 border-b border-gray-100">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-2 sm:mr-3"></div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Upload New Timetable</h3>
        </div>
        
        <div className="w-full max-w-2xl mx-auto">
          {branchLoading ? (
            <div className="flex justify-center items-center py-6 sm:py-10">
              <FaSpinner className="animate-spin text-blue-500 text-xl sm:text-2xl" />
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Branch Selection */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">Select Branch</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BsBuilding className="text-gray-400" />
                  </div>
                  <select
                    value={addselected.branch}
                    onChange={(e) =>
                      setAddSelected({ ...addselected, branch: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Branch</option>
                    {branch?.map((b) => (
                      <option key={b._id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Semester Selection */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">Select Semester</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoSchoolOutline className="text-gray-400" />
                  </div>
                  <select
                    value={addselected.semester}
                    onChange={(e) =>
                      setAddSelected({ ...addselected, semester: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              </div>
              
              {/* File Upload */}
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">Upload Timetable</label>
                
                {!previewUrl ? (
                  <label
                    htmlFor="upload"
                    className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 cursor-pointer hover:border-blue-500 transition-all bg-gray-50"
                  >
                    <FiUpload className="text-2xl sm:text-3xl text-blue-500 mb-2" />
                    <p className="text-gray-700 font-medium text-sm sm:text-base">Click to upload timetable</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">PNG, JPG or PDF (Max 10MB)</p>
                  </label>
                ) : (
                  <div className="mt-2 relative border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start">
                      {previewUrl.includes("pdf") ? (
                        <BsFileEarmarkPdf className="text-3xl sm:text-4xl text-red-500 mb-2 sm:mb-0 sm:mr-3 sm:mt-1" />
                      ) : (
                        <div className="w-full sm:w-24 h-32 sm:h-24 bg-gray-100 rounded-md overflow-hidden mb-3 sm:mb-0 sm:mr-4">
                          <img src={previewUrl} alt="Timetable preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium text-sm sm:text-base">{file?.name || "Uploaded Timetable"}</p>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">{file?.size ? `${(file.size / 1024).toFixed(2)} KB` : ""}</p>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setFile("");
                            setPreviewUrl("");
                          }}
                          className="mt-2 text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium flex items-center"
                        >
                          <AiOutlineClose className="mr-1" /> Remove file
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  name="upload"
                  id="upload"
                  accept="image/*,application/pdf"
                  hidden
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="mt-6 sm:mt-8 flex justify-center sm:justify-end">
                <button
                  type="button"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md text-sm sm:text-base font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={addTimetableHandler}
                  disabled={loading || !addselected.branch || !addselected.semester || !file}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" />
                      <span>Upload Timetable</span>
                    </>
                  )}
                </button>
              </div>
              
              {previewUrl && !previewUrl.includes("pdf") && (
                <div className="mt-6 sm:mt-8 border border-gray-200 rounded-lg p-3 sm:p-4">
                  <h4 className="text-gray-700 font-medium text-sm sm:text-base mb-2 sm:mb-3">Preview</h4>
                  <div className="flex justify-center bg-gray-50 p-2 sm:p-4 rounded-md">
                    <img 
                      className="max-w-full max-h-[300px] sm:max-h-[500px] object-contain rounded-md shadow-sm" 
                      src={previewUrl} 
                      alt="Timetable preview" 
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timetable;
