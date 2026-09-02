import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Heading from "../../components/Heading";
import { MdOutlineDelete, MdAdd } from "react-icons/md";
import { FiBook, FiSearch, FiEdit, FiPlus } from "react-icons/fi";
import { baseApiURL } from "../../baseUrl";

const Subjects = () => {
  const [data, setData] = useState({
    name: "",
    code: "",
  });
  const [selected, setSelected] = useState("add");
  const [subject, setSubject] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    getSubjectHandler();
  }, []);

  // Filter subjects based on search term
  useEffect(() => {
    if (!subject) return;

    if (searchTerm.trim() === "") {
      setFilteredSubjects(subject);
    } else {
      const filtered = subject.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toString().includes(searchTerm)
      );
      setFilteredSubjects(filtered);
    }
  }, [searchTerm, subject]);

  const getSubjectHandler = () => {
    setLoading(true);
    axios
      .get(`${baseApiURL()}/subject/getSubject`)
      .then((response) => {
        setLoading(false);
        if (response.data.success) {
          setSubject(response.data.subject || []);
          setFilteredSubjects(response.data.subject || []);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error.message || "Failed to fetch subjects");
      });
  };

  const addSubjectHandler = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!data.name.trim() || !data.code.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    toast.loading("Adding Subject");
    const headers = {
      "Content-Type": "application/json",
    };

    axios
      .post(`${baseApiURL()}/subject/addSubject`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        setLoading(false);

        if (response.data.success) {
          toast.success(response.data.message);
          setData({ name: "", code: "" });
          getSubjectHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setLoading(false);
        toast.error(error.response?.data?.message || "Failed to add subject");
      });
  };

  const deleteSubjectHandler = (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) {
      return;
    }

    setLoading(true);
    toast.loading("Deleting Subject");
    const headers = {
      "Content-Type": "application/json",
    };

    axios
      .delete(`${baseApiURL()}/subject/deleteSubject/${id}`, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        setLoading(false);

        if (response.data.success) {
          toast.success(response.data.message);
          getSubjectHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setLoading(false);
        toast.error(error.response?.data?.message || "Failed to delete subject");
      });
  };

  return (
    <div className="w-full mx-auto mt-6 md:mt-8 lg:mt-10 flex justify-center items-start flex-col mb-6 md:mb-8 lg:mb-10 px-4 md:px-6 lg:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 sm:gap-0">
        <div className="flex items-center">
          <FiBook className="text-blue-600 text-2xl mr-2" />
          <Heading title="Course Management" />
        </div>
        <div className="flex justify-start sm:justify-end items-center w-full mt-4 sm:mt-0">
          <button
            className={`${
              selected === "add"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } flex items-center px-4 py-2 mr-4 md:mr-6 rounded-md transition-colors`}
            onClick={() => setSelected("add")}
          >
            <FiPlus className="mr-2" />
            Add Course
          </button>
          <button
            className={`${
              selected === "view"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } flex items-center px-4 py-2 rounded-md transition-colors`}
            onClick={() => setSelected("view")}
          >
            <FiBook className="mr-2" />
            View Courses
          </button>
        </div>
      </div>
      <div className="w-full mt-6">
        {selected === "add" && (
          <div className="w-full bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Add New Course</h2>
            <form onSubmit={addSubjectHandler} className="flex flex-col md:flex-row flex-wrap gap-6">
              <div className="w-full md:w-[45%]">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  value={data.code}
                  onChange={(e) => setData({ ...data, code: e.target.value })}
                  className="w-full bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none py-2 px-4 transition-colors duration-200 ease-in-out"
                  placeholder="e.g. CS101"
                  required
                />
              </div>
              <div className="w-full md:w-[45%]">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none py-2 px-4 transition-colors duration-200 ease-in-out"
                  placeholder="e.g. Introduction to Computer Science"
                  required
                />
              </div>
              <div className="w-full flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MdAdd className="mr-2" />
                      Add Course
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        {selected === "view" && (
          <div className="w-full bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Course Directory</h2>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
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
            ) : filteredSubjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubjects.map((item) => (
                      <tr key={item._id || item.code} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-red-600 hover:text-red-900 ml-4 flex items-center justify-end w-full"
                            onClick={() => deleteSubjectHandler(item._id)}
                          >
                            <MdOutlineDelete className="mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-10 flex flex-col items-center justify-center text-center rounded-md">
                <FiBook className="text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {searchTerm ? "No matching courses found" : "No courses available"}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {searchTerm
                    ? `No courses matching "${searchTerm}" were found. Try a different search term.`
                    : "There are no courses in the system yet. Add your first course to get started."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;
