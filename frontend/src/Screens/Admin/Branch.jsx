import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import { MdOutlineDelete, MdAdd } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { baseApiURL } from "../../baseUrl";

const Branch = () => {
  const [data, setData] = useState({
    name: "",
  });
  const [branch, setBranch] = useState([]);
  const [selected, setSelected] = useState("add");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBranches, setFilteredBranches] = useState([]);

  useEffect(() => {
    getBranchHandler();
  }, []);

  // Filter branches based on search term
  useEffect(() => {
    if (!branch) return;
    
    if (searchTerm.trim() === "") {
      setFilteredBranches(branch);
    } else {
      const filtered = branch.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBranches(filtered);
    }
  }, [branch, searchTerm]);

  // Get all branches
  const getBranchHandler = () => {
    axios
      .get(`${baseApiURL()}/branch/getBranch`)
      .then((response) => {
        if (response.data.success) {
          setBranch(response.data.branches);
          setFilteredBranches(response.data.branches);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch branches");
      });
  };

  // Add new branch
  const addBranchHandler = () => {
    // Validate input
    if (!data.name.trim()) {
      toast.error("Please enter a branch name");
      return;
    }
    
    setLoading(true);
    toast.loading("Adding Branch");
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    axios
      .post(`${baseApiURL()}/branch/addBranch`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        setLoading(false);
        
        if (response.data.success) {
          toast.success(response.data.message);
          setData({ name: "" });
          getBranchHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setLoading(false);
        console.error(error);
        toast.error("Something went wrong");
      });
  };

  // Delete branch
  const deleteBranchHandler = (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) {
      return;
    }
    
    setLoading(true);
    toast.loading("Deleting Branch");
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    axios
      .delete(`${baseApiURL()}/branch/deleteBranch/${id}`, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        setLoading(false);
        
        if (response.data.success) {
          toast.success(response.data.message);
          getBranchHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        setLoading(false);
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to delete branch");
      });
  };

  return (
    <div className="w-full mx-auto mt-6 md:mt-8 lg:mt-10 flex justify-center items-start flex-col mb-6 md:mb-8 lg:mb-10 px-4 md:px-6 lg:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 sm:gap-0">
        <Heading title="Branch Management" />
        <div className="flex justify-start sm:justify-end items-center w-full mt-4 sm:mt-0">
          <button
            className={`${
              selected === "add"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } flex items-center px-4 py-2 mr-4 md:mr-6 rounded-md transition-colors text-sm md:text-base`}
            onClick={() => setSelected("add")}
          >
            <MdAdd className="mr-2" />
            Add Branch
          </button>
          <button
            className={`${
              selected === "view"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } flex items-center px-4 py-2 rounded-md transition-colors text-sm md:text-base`}
            onClick={() => setSelected("view")}
          >
            View Branches
          </button>
        </div>
      </div>
      
      <div className="w-full mt-6">
        {selected === "add" && (
          <div className="w-full bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Add New Branch</h2>
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="w-full md:w-1/2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base outline-none py-2 px-4 transition-colors duration-200 ease-in-out"
                  placeholder="e.g. Computer Science"
                  required
                />
              </div>
              <button
                onClick={addBranchHandler}
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
                    Add Branch
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {selected === "view" && (
          <div className="w-full bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Branch Directory</h2>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search branches..."
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
            ) : filteredBranches && filteredBranches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Name</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBranches.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-red-600 hover:text-red-900 flex items-center justify-end w-full"
                            onClick={() => deleteBranchHandler(item._id)}
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
                <div className="text-4xl text-gray-400 mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {searchTerm ? "No matching branches found" : "No branches available"}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {searchTerm
                    ? `No branches matching "${searchTerm}" were found. Try a different search term.`
                    : "There are no branches in the system yet. Add your first branch to get started."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Branch;
