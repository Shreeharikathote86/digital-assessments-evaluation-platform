import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoMdLink } from "react-icons/io";
import { HiOutlineCalendar, HiOutlineSearch, HiOutlineDocumentText, HiOutlineAcademicCap } from "react-icons/hi";
import { FiDownload, FiExternalLink, FiFileText, FiBook } from "react-icons/fi";
import { BsJournalBookmark, BsFilterLeft } from "react-icons/bs";
import toast from "react-hot-toast";
import { baseApiURL } from "../../baseUrl";

const Material = () => {
  const [subject, setSubject] = useState();
  const [selected, setSelected] = useState("");
  const [material, setMaterial] = useState();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      setLoading(true);
      toast.loading("Loading Subjects");
      try {
        const response = await axios.get(`${baseApiURL()}/subject/getSubject`);
        toast.dismiss();
        setLoading(false);
        if (response.data.success) {
          setSubject(response.data.subject);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        setLoading(false);
        toast.dismiss();
        toast.error(error.message);
      }
    };
    
    loadSubjects();
  }, []);

  const getSubjectMaterial = () => {
    if (!selected || selected === "select") {
      toast.error("Please select a subject first");
      return;
    }
    
    setSearchLoading(true);
    const headers = {
      "Content-Type": "application/json",
    };
    
    axios
      .post(
        `${baseApiURL()}/material/getMaterial`,
        { subject: selected },
        { headers }
      )
      .then((response) => {
        setSearchLoading(false);
        if (response.data.success) {
          setMaterial(response.data.material);
        } else {
          toast.error("Failed to fetch materials");
        }
      })
      .catch((error) => {
        setSearchLoading(false);
        toast.error("Error fetching materials");
        console.error(error);
      });
  };

  const onSelectChangeHandler = (e) => {
    setMaterial(null);
    setSelected(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 sm:p-5 rounded-lg shadow-lg mb-4 sm:mb-6 w-full">
        <div className="flex items-center">
          <div className="mr-3 text-3xl sm:text-4xl">
            <BsJournalBookmark />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">Study Materials</h2>
            <p className="text-sm sm:text-base opacity-75 mb-0">Access lecture notes, references, and resources</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full mb-4">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center">
              <FiBook className="mr-2 text-blue-600" size={20} />
              <h5 className="text-base sm:text-lg font-medium text-gray-800 mb-0">Subject Materials</h5>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selected}
                onChange={onSelectChangeHandler}
                className="w-full sm:w-auto px-3 py-2 border border-blue-500 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ minWidth: '200px' }}
              >
                <option value="select">-- Select Subject --</option>
                {subject && subject.map((item) => (
                  <option value={item.name} key={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <button 
                onClick={getSubjectMaterial}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <>
                    <HiOutlineSearch className="mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-500 text-sm">Loading subjects...</p>
              </div>
            </div>
          ) : !material ? (
            <div className="text-center py-10">
              <div className="text-gray-400 mb-3">
                <HiOutlineAcademicCap size={48} className="mx-auto" />
              </div>
              <h5 className="text-lg font-medium text-gray-800 mb-2">Select a Subject</h5>
              <p className="text-gray-500 text-sm">Choose a subject from the dropdown to view available materials</p>
            </div>
          ) : material.length === 0 ? (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-md flex items-start">
              <div className="mr-3 text-xl text-blue-500">
                <HiOutlineDocumentText />
              </div>
              <div>
                <h5 className="font-medium mb-1">No Materials Found</h5>
                <p className="text-sm text-blue-700 mb-0">No study materials are available for {selected} at this time.</p>
              </div>
            </div>
          ) : (
            <div className="mt-2 space-y-4">
              {material.reverse().map((item, index) => (
                <div 
                  key={index} 
                  className={`rounded-lg shadow-sm border-l-4 ${item.link ? 'border-l-blue-500' : 'border-l-gray-400'} border border-gray-200 hover:shadow-md transition-shadow`}
                >
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                      <div className="flex-1">
                        <h5 
                          className={`mb-2 flex flex-wrap items-center gap-2 text-base sm:text-lg font-medium ${item.link ? 'text-blue-600 cursor-pointer' : 'text-gray-800'}`}
                          onClick={() => item.link && window.open(process.env.REACT_APP_MEDIA_LINK + "/" + item.link)}
                        >
                          <FiFileText className="flex-shrink-0" />
                          <span>{item.title}</span>
                          {item.link && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              <FiExternalLink className="mr-1" size={12} />
                              Resource
                            </span>
                          )}
                        </h5>
                        <div className="flex flex-wrap items-center text-gray-500 text-sm mb-2 gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md text-xs">
                            {item.subject}
                          </span>
                          <span>Uploaded by: {item.faculty}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                        <div className="flex items-center text-gray-500 text-xs">
                          <HiOutlineCalendar className="mr-1" />
                          {formatDate(item.createdAt)}
                        </div>
                        
                        {item.link && (
                          <button 
                            onClick={() => window.open(process.env.REACT_APP_MEDIA_LINK + "/" + item.link)}
                            className="flex items-center px-3 py-1.5 border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-md transition-colors text-sm"
                          >
                            <FiDownload className="mr-1.5" size={14} />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Material;
