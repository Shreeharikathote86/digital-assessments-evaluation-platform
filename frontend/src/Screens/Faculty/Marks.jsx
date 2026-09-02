import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { baseApiURL } from "../../baseUrl";
import { FiBookOpen, FiUpload, FiUsers } from "react-icons/fi";
import { BsBuilding, BsBook } from "react-icons/bs";
import { IoSchoolOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { HiOutlineDocumentReport } from "react-icons/hi";

const Marks = () => {
  const [subject, setSubject] = useState();
  const [branch, setBranch] = useState();
  const [studentData, setStudentData] = useState();
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(true);
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [uploadingMarks, setUploadingMarks] = useState(false);
  const [selected, setSelected] = useState({
    branch: "",
    semester: "",
    subject: "",
    examType: "",
  });
  const loadStudentDetails = () => {
    // Validate inputs
    if (!selected.branch || !selected.semester || !selected.subject || !selected.examType) {
      toast.error("Please select all fields before loading student data");
      return;
    }

    setLoading(true);
    toast.loading("Loading student data...");

    const headers = {
      "Content-Type": "application/json",
    };

    axios
      .post(
        `${baseApiURL()}/student/details/getDetails`,
        { branch: selected.branch, semester: selected.semester },
        { headers }
      )
      .then((response) => {
        setLoading(false);
        toast.dismiss();

        if (response.data.success) {
          if (response.data.user && response.data.user.length > 0) {
            setStudentData(response.data.user);
            toast.success(`Loaded ${response.data.user.length} students`);
          } else {
            toast.error("No students found for the selected criteria");
          }
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.dismiss();
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to load student data");
      });
  };

  const submitMarksHandler = () => {
    setUploadingMarks(true);
    toast.loading("Uploading marks...");

    let container = document.getElementById("markContainer");
    let promises = [];

    container.childNodes.forEach((enroll) => {
      const markValue = document.getElementById(enroll.id + "marks").value;
      if (markValue.trim() !== "") {
        promises.push(
          setStudentMarksHandler(enroll.id, markValue)
        );
      }
    });

    Promise.all(promises)
      .then(() => {
        setUploadingMarks(false);
        toast.dismiss();
        toast.success("All marks uploaded successfully");
      })
      .catch((error) => {
        setUploadingMarks(false);
        toast.dismiss();
        toast.error("There was an error uploading some marks");
        console.error(error);
      });
  };

  const setStudentMarksHandler = (enrollment, value) => {
    const headers = {
      "Content-Type": "application/json",
    };

    return new Promise((resolve, reject) => {
      axios
        .post(
          `${baseApiURL()}/marks/addMarks`,
          {
            enrollmentNo: enrollment,
            [selected.examType]: {
              [selected.subject]: value,
            },
          },
          { headers }
        )
        .then((response) => {
          if (response.data.success) {
            resolve(response.data);
          } else {
            reject(response.data.message);
          }
        })
        .catch((error) => {
          console.error(error);
          reject(error.message);
        });
    });
  };

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

  const getSubjectData = () => {
    setSubjectLoading(true);
    toast.loading("Loading Subjects");
    
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((response) => {
        toast.dismiss();
        setSubjectLoading(false);
        
        if (response.data.success) {
          console.log('Subjects loaded:', response.data.subject);
          setSubject(response.data.subject);
        } else {
          console.error('Failed to load subjects:', response.data.message);
          toast.error(response.data.message || 'Failed to load subjects');
          setSubject([]);
        }
      })
      .catch((error) => {
        console.error('Error loading subjects:', error);
        toast.dismiss();
        toast.error(error.message || 'Failed to load subjects');
        setSubject([]);
        setSubjectLoading(false);
      });
  };

  useEffect(() => {
    getBranchData();
    getSubjectData(); // Load subjects on component mount
  }, []);

  const resetValueHandler = () => {
    setStudentData(null);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-3 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
        <div className="flex items-center">
          <HiOutlineDocumentReport className="text-white text-xl sm:text-2xl mr-2 sm:mr-3" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Upload Student Marks</h2>
        </div>
        <p className="text-blue-100 mt-1 sm:mt-2 pl-1 text-sm sm:text-base">Manage and upload assessment marks for students</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 hover:shadow-md transition-all">
        {!studentData && (
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-center mb-4 sm:mb-6 pb-2 sm:pb-4 border-b border-gray-100">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-2 sm:mr-3"></div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Select Assessment Details</h3>
            </div>

            {branchLoading ? (
              <div className="flex justify-center items-center py-6 sm:py-10">
                <FaSpinner className="animate-spin text-blue-500 text-xl sm:text-2xl" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Branch Selection */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">Select Branch</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BsBuilding className="text-gray-400" />
                      </div>
                      <select
                        value={selected.branch}
                        onChange={(e) => {
                          setSelected({ ...selected, branch: e.target.value, subject: "" });
                          setSubject(null);
                        }}
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
                        value={selected.semester}
                        onChange={(e) => {
                          setSelected({ ...selected, semester: e.target.value, subject: "" });
                          // Don't set subject to null, just refresh the list
                          if (e.target.value && selected.branch) {
                            getSubjectData();
                          }
                        }}
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

                  {/* Subject Selection */}
                  <div className="w-full">
                    <label htmlFor="subject" className="leading-7 text-base ">
                      Select Subject
                    </label>
                    <select
                      id="subject"
                      className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                      value={selected.subject}
                      onChange={(e) =>
                        setSelected({ ...selected, subject: e.target.value })
                      }
                    >
                      <option value="">-- Select Subject --</option>
                      {subjectLoading ? (
                        <option disabled>Loading subjects...</option>
                      ) : subject && subject.length > 0 ? (
                        subject.map((subj) => (
                          <option value={subj.name} key={subj._id || subj.name}>
                            {subj.name} {subj.code ? `(${subj.code})` : ''}
                          </option>
                        ))
                      ) : (
                        <option disabled>No subjects available</option>
                      )}
                    </select>
                  </div>
                  {/* Exam Type Selection */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">Select Assessment Type</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiBookOpen className="text-gray-400" />
                      </div>
                      <select
                        value={selected.examType}
                        onChange={(e) => setSelected({ ...selected, examType: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Assessment Type</option>
                        <option value="isa1">ISA 1 (Internal Assessment 1)</option>
                        <option value="isa2">ISA 2 (Internal Assessment 2)</option>
                        <option value="esa">ESA (End Semester Assessment)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 flex justify-center">
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md text-sm sm:text-base font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={loadStudentDetails}
                    disabled={loading || !selected.branch || !selected.semester || !selected.subject || !selected.examType}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        <span>Loading Students...</span>
                      </>
                    ) : (
                      <>
                        <FiUsers className="mr-2" />
                        <span>Load Students</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {studentData && studentData.length !== 0 && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center mb-4 sm:mb-6">
              <button
                onClick={resetValueHandler}
                className="mr-4 text-blue-600 hover:text-blue-800 flex items-center text-sm sm:text-base"
              >
                <BiArrowBack className="mr-1" /> Back
              </button>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Enter Student Marks</h3>
            </div>

            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center">
              <div className="flex-1 mb-2 sm:mb-0">
                <h4 className="text-blue-700 font-medium text-sm sm:text-base">Assessment Details</h4>
                <p className="text-blue-600 mt-1 text-xs sm:text-sm">
                  {selected.examType.toUpperCase()} Marks | {selected.branch} | Semester {selected.semester} | {selected.subject}
                </p>
              </div>
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm self-start sm:self-auto">
                {studentData.length} Students
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-3 sm:p-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-700 text-sm sm:text-base">Enter Marks for Each Student</h4>
              </div>

              <div
                className="p-3 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                id="markContainer"
              >
                {studentData.map((student) => {
                  return (
                    <div
                      key={student.enrollmentNo}
                      className="flex flex-col border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                      id={student.enrollmentNo}
                    >
                      <div className="bg-gray-50 p-2 sm:p-3 border-b border-gray-200 flex items-center">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 text-xs sm:text-sm">
                          {student.firstName ? student.firstName[0] : "S"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                            {student.firstName} {student.middleName} {student.lastName}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">{student.enrollmentNo}</p>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Enter Marks
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={selected.examType === "isa1" || selected.examType === "isa2" ? "20" : "60"}
                          className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={`Enter ${selected.examType.toUpperCase()} marks`}
                          id={`${student.enrollmentNo}marks`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-md text-sm sm:text-base font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={submitMarksHandler}
                disabled={uploadingMarks}
              >
                {uploadingMarks ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" />
                    <span>Upload Student Marks</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marks;
