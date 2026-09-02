import React, { useEffect } from "react";
import { useState } from "react";
import Heading from "./Heading";
import axios from "axios";
import { IoMdLink } from "react-icons/io";
import { HiOutlineCalendar } from "react-icons/hi";
import { useLocation } from "react-router-dom";
import { IoAddOutline, IoNotificationsOutline } from "react-icons/io5";
import { MdDeleteOutline, MdEditNote } from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";
import { FiExternalLink } from "react-icons/fi";
import { BsInfoCircle } from "react-icons/bs";
import toast from "react-hot-toast";
import { baseApiURL } from "../baseUrl";
const Notice = () => {
  const router = useLocation();
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    title: "",
    description: "",
    type: "student",
    link: "",
  });

  const getNoticeHandler = () => {
    setLoading(true);
    setError(null);
    let data = {};
    if (router.pathname.replace("/", "") === "student") {
      data = {
        type: ["student", "both"],
      };
    } else {
      data = {
        type: ["student", "both", "faculty"],
      };
    }
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/notice/getNotice`, data, {
        headers: headers,
      })
      .then((response) => {
        setLoading(false);
        if (response.data.success) {
          setNotice(response.data.notice);
        } else {
          setError(response.data.message);
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        setError(error.response?.data?.message || "Failed to fetch notices");
        toast.dismiss();
        toast.error(error.response?.data?.message || "Failed to fetch notices");
      });
  };

  useEffect(() => {
    getNoticeHandler();
  }, [router.pathname]);

  const addNoticehandler = (e) => {
    e.preventDefault();
    toast.loading("Adding Notice");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(`${baseApiURL()}/notice/addNotice`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          getNoticeHandler();
          setOpen(!open);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  const deleteNoticehandler = (id) => {
    toast.loading("Deleting Notice");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .delete(`${baseApiURL()}/notice/deleteNotice/${id}`, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          getNoticeHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  const updateNoticehandler = (e) => {
    e.preventDefault();
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .put(`${baseApiURL()}/notice/updateNotice/${id}`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          getNoticeHandler();
          setOpen(!open);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  const setOpenEditSectionHandler = (index) => {
    setEdit(true);
    setOpen(!open);
    setData({
      title: notice[index].title,
      description: notice[index].description,
      type: notice[index].type,
      link: notice[index].link,
    });
    setId(notice[index]._id);
  };

  const openHandler = () => {
    setOpen(!open);
    setEdit(false);
    setData({ title: "", description: "", type: "student", link: "" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-lg shadow-md">
        <div className="flex items-center">
          <span className="text-white text-2xl mr-2">
            <IoNotificationsOutline />
          </span>
          <h2 className="text-xl font-bold text-white">{open ? "Add Notice" : "Notice Board"}</h2>
        </div>
        {!open && router.pathname.replace("/", "") !== "student" && (
          <button
            className="bg-white text-blue-600 px-4 rounded-md text-sm py-2 hover:bg-blue-50 flex justify-center items-center transition-all shadow-sm"
            onClick={openHandler}
          >
            <span className="text-base mr-1">
              <IoAddOutline />
            </span>
            Add Notice
          </button>
        )}
        {open && (
          <button
            className="bg-white text-blue-600 px-4 rounded-md text-sm py-2 hover:bg-blue-50 flex justify-center items-center transition-all shadow-sm"
            onClick={openHandler}
          >
            <span className="text-base mr-1">
              <BiArrowBack />
            </span>
            Back
          </button>
        )}
      </div>

      {!open && (
        <div className="mt-6 w-full">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-100 flex items-start">
              <BsInfoCircle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : notice && notice.length !== 0 ? (
            notice.map((item, index) => {
              return (
                <div
                  key={index}
                  className="bg-white p-5 mb-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  {router.pathname.replace("/", "") !== "student" && (
                    <div className="absolute top-4 right-4 flex justify-center items-center space-x-2">
                      <button
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                        onClick={() => deleteNoticehandler(item._id)}
                        title="Delete Notice"
                      >
                        <MdDeleteOutline size={20} />
                      </button>
                      <button
                        className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded-full hover:bg-blue-50"
                        onClick={() => setOpenEditSectionHandler(index)}
                        title="Edit Notice"
                      >
                        <MdEditNote size={20} />
                      </button>
                    </div>
                  )}

                  <h3
                    className={`text-xl font-semibold flex items-center mb-2 pr-16 ${item.link ? "text-blue-600" : "text-gray-800"}`}
                  >
                    {item.title}
                  </h3>

                  <p className="text-gray-600 mb-3 mt-2">{item.description}</p>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center text-gray-500 text-sm">
                      <HiOutlineCalendar className="mr-1" />
                      {formatDate(item.createdAt)}
                    </div>
                    
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        View Link <FiExternalLink className="ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 flex flex-col items-center justify-center h-40">
              <IoNotificationsOutline className="text-blue-500 text-4xl mb-2" />
              <p className="text-blue-600 text-center">No notices available at the moment</p>
            </div>
          )}
        </div>
      )}
      {open && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <form className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Notice Title</label>
                <input
                  type="text"
                  id="title"
                  className="bg-gray-50 border border-gray-200 py-3 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={data.title}
                  placeholder="Enter notice title"
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                />
              </div>
              
              <div className="w-full">
                <label htmlFor="link" className="block text-gray-700 font-medium mb-2">Notice Link (Optional)</label>
                <input
                  type="text"
                  id="link"
                  value={data.link}
                  placeholder="https://example.com"
                  className="bg-gray-50 border border-gray-200 py-3 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => setData({ ...data, link: e.target.value })}
                />
              </div>
            </div>
            
            <div className="w-full mt-6">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Notice Description</label>
              <textarea
                id="description"
                cols="30"
                rows="4"
                placeholder="Enter notice details"
                className="bg-gray-50 border border-gray-200 py-3 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                value={data.description}
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
              ></textarea>
            </div>
            
            <div className="w-full mt-6">
              <label htmlFor="type" className="block text-gray-700 font-medium mb-2">Type Of Notice</label>
              <select
                id="type"
                className="bg-gray-50 border border-gray-200 py-3 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="both">Both</option>
              </select>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={openHandler}
                className="bg-gray-200 text-gray-800 mr-4 px-6 rounded-md text-base py-2.5 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              
              {edit ? (
                <button
                  type="button"
                  onClick={updateNoticehandler}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 rounded-md text-base py-2.5 hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm"
                >
                  Update Notice
                </button>
              ) : (
                <button
                  type="button"
                  onClick={addNoticehandler}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 rounded-md text-base py-2.5 hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm"
                >
                  Add Notice
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Notice;
