import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { baseApiURL } from '../../baseUrl';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiCalendar, FiBookOpen, FiFileText } from 'react-icons/fi';
import { BiBookAlt, BiTimeFive } from 'react-icons/bi';
import { MdTitle, MdDescription, MdAssignment } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const { userData, userLoginId } = useSelector((state) => state);
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, id: null });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    branch: '',
    semester: '',
    dueDate: '',
    totalMarks: '',
    assessmentType: 'Other'
  });
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);

  // Fetch assignments, subjects, and branches on component mount
  useEffect(() => {
    fetchAssignments();
    fetchSubjects(); // Initially fetch all subjects
    fetchBranches();
    
    // Log user information
    console.log('User data:', userData);
    console.log('User login ID:', userLoginId);
  }, []);
  
  // Update form data when user data is available
  useEffect(() => {
    if (userLoginId) {
      console.log('Setting createdBy in form data to:', userLoginId);
    }
  }, [userLoginId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      toast.loading('Loading assignments...');
      const response = await axios.post(`${baseApiURL()}/assignment/getAssignments`, {
        createdBy: userLoginId
      });
      toast.dismiss();
      setAssignments(response.data.assignments || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.dismiss();
      toast.error('Failed to load assignments');
      setError('Failed to load assignments. Please try again later.');
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const response = await axios.get(`${baseApiURL()}/subject/getSubject`);
      console.log('Subjects response:', response.data);
      
      if (response.data.success) {
        setSubjects(response.data.subject || []);
      } else {
        console.warn('Failed to load subjects:', response.data.message);
        setSubjects([]);
        toast.error('Failed to load subjects');
      }
      setSubjectsLoading(false);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
      setSubjects([]);
      setSubjectsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setBranchesLoading(true);
      console.log('Fetching branches from:', `${baseApiURL()}/branch/getBranch`);
      const response = await axios.get(`${baseApiURL()}/branch/getBranch`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Branches response:', response.data);
      
      if (response.data.success) {
        setBranches(response.data.branches || []);
      } else {
        console.warn('API returned success: false for branches', response.data.message);
        setBranches([]);
        toast.error('Failed to load branches: ' + (response.data.message || 'Unknown error'));
      }
      setBranchesLoading(false);
    } catch (error) {
      console.error('Error fetching branches:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load branches');
      setBranchesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    
    // Update form data
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      
      // If branch or semester changed, reset subject and fetch filtered subjects
      if (name === 'branch' || name === 'semester') {
        // Only fetch subjects if both branch and semester are selected
        const branchToUse = name === 'branch' ? value : prevData.branch;
        const semesterToUse = name === 'semester' ? value : prevData.semester;
        
        console.log('Branch/semester changed:', { branchToUse, semesterToUse });
        
        if (branchToUse && semesterToUse) {
          console.log('Both branch and semester selected, fetching subjects...');
          // Use setTimeout to ensure state is updated before API call
          setTimeout(() => {
            fetchSubjects(branchToUse, semesterToUse);
          }, 0);
        }
        
        // Reset subject if branch or semester changes
        if (prevData.subject) {
          console.log('Resetting subject selection');
          newData.subject = '';
        }
      }
      
      return newData;
    });
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate all required fields
      if (!formData.title.trim()) {
        toast.error('Please enter a title for the assignment');
        setSubmitting(false);
        return;
      }
      
      if (!formData.description.trim()) {
        toast.error('Please enter a description for the assignment');
        setSubmitting(false);
        return;
      }
      
      if (!formData.subject) {
        toast.error('Please select a subject');
        setSubmitting(false);
        return;
      }
      
      if (!formData.branch) {
        toast.error('Please select a branch');
        setSubmitting(false);
        return;
      }
      
      if (!formData.semester) {
        toast.error('Please select a semester');
        setSubmitting(false);
        return;
      }
      
      if (!formData.dueDate) {
        toast.error('Please select a due date');
        setSubmitting(false);
        return;
      }
      
      if (!formData.totalMarks) {
        toast.error('Please enter total marks');
        setSubmitting(false);
        return;
      }
      
      // Add faculty ID to the form data
      if (!userLoginId) {
        console.warn('Faculty ID not available, attempting to proceed anyway');
      }
      
      toast.loading('Creating assignment...');
      
      // Log the data being sent to the server
      const assignmentData = {
        ...formData,
        createdBy: userLoginId || userData?.loginid || 'faculty_temp_id', // Try multiple sources for faculty ID
        facultyName: userData?.fullname || 'Faculty',
        assessmentType: formData.assessmentType || 'Other' // Ensure assessmentType is included
      };
      
      // Make sure createdBy is not undefined or empty
      if (!assignmentData.createdBy || assignmentData.createdBy === '') {
        assignmentData.createdBy = 'faculty_' + Date.now(); // Generate a temporary ID if needed
      }
      
      console.log('Sending assignment data:', assignmentData);
      
      const response = await axios.post(`${baseApiURL()}/assignment/createAssignment`, assignmentData);
      
      toast.dismiss();
      
      if (response.data.success) {
        toast.success('Assignment created successfully!');
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          subject: '',
          branch: '',
          semester: '',
          dueDate: '',
          totalMarks: '',
          assessmentType: 'Other'
        });
        fetchAssignments(); // Refresh the assignments list
      } else {
        toast.error(response.data.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      setLoading(true);
      setError(null);
      toast.loading('Deleting assignment...');
      
      const response = await axios.delete(`${baseApiURL()}/assignment/deleteAssignment/${id}`);
      
      toast.dismiss();
      
      if (response.data.success) {
        toast.success('Assignment deleted successfully!');
        setDeleteConfirmation({ show: false, id: null });
        fetchAssignments(); // Refresh the assignments list
      } else {
        toast.error(response.data.message || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirmation = (id) => {
    setDeleteConfirmation({ show: true, id });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, id: null });
  };

  const handleViewSubmissions = (assignmentId) => {
    navigate(`/faculty/assignment-submissions/${assignmentId}`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-3 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
        <div className="flex items-center">
          <FiFileText className="text-white text-xl sm:text-2xl mr-2 sm:mr-3" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Assignment Management</h2>
        </div>
        <p className="text-blue-100 mt-1 sm:mt-2 pl-1 text-sm sm:text-base">Create and manage assignments for your students</p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 hover:shadow-md transition-all">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 pb-2 sm:pb-4 border-b border-gray-100">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full mr-2 sm:mr-3"></div>
            <h3 className="text-lg font-medium text-gray-800">Your Assignments</h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md text-sm sm:text-base hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-1 sm:mr-2" />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            <span className="ml-2 text-gray-600">Loading assignments...</span>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <FiFileText className="mx-auto text-gray-400 text-4xl mb-2" />
            <h4 className="text-lg font-medium text-gray-700 mb-1">No Assignments Yet</h4>
            <p className="text-gray-500 mb-4">Create your first assignment to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              <span>Create Assignment</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiFileText className="text-blue-600" />
                        </div>
                        <div className="ml-2 sm:ml-4">
                          <div className="text-sm sm:text-base font-medium text-gray-900 truncate max-w-[120px] sm:max-w-xs">
                            {assignment.title}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {assignment.subject}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.subject}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.branch}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{formatDate(assignment.dueDate)}</div>
                      <div className="text-xs text-gray-500 sm:hidden">
                        {assignment.assessmentType}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.assessmentType === 'ISA1' ? 'bg-green-100 text-green-800' :
                        assignment.assessmentType === 'ISA2' ? 'bg-blue-100 text-blue-800' :
                        assignment.assessmentType === 'ESA' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.assessmentType}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewSubmissions(assignment._id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Submissions"
                        >
                          <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => showDeleteConfirmation(assignment._id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                          title="Delete Assignment"
                        >
                          <FiTrash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-3 sm:px-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FiPlus className="mr-2 text-blue-600" />
                Create New Assignment
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateAssignment} className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Title */}
                <div className="mb-4">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    <MdTitle className="mr-2 text-blue-600" /> Assignment Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter assignment title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {/* Description */}
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    <MdDescription className="mr-2 text-blue-600" /> Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
                
                {/* Subject */}
                <div className="mb-4">
                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    <BiBookAlt className="mr-2 text-blue-600" /> Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjectsLoading ? (
                      <option disabled>Loading subjects...</option>
                    ) : subjects.length > 0 ? (
                      subjects.map((subject) => (
                        <option key={subject._id} value={subject.name}>
                          {subject.name} ({subject.code})
                        </option>
                      ))
                    ) : (
                      <option disabled>No subjects available for selected branch/semester</option>
                    )}
                  </select>
                </div>
                
                {/* Branch */}
                <div className="mb-4">
                  <label
                    htmlFor="branch"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    <FiBookOpen className="mr-2 text-blue-600" /> Branch
                  </label>
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branchesLoading ? (
                      <option disabled>Loading branches...</option>
                    ) : (
                      branches.map((branch) => (
                        <option key={branch._id} value={branch.name}>
                          {branch.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                {/* Semester */}
                <div className="mb-4">
                  <label
                    htmlFor="semester"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    <MdAssignment className="mr-2 text-blue-600" /> Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Due Date */}
                <div className="mb-4">
                  <label
                    htmlFor="dueDate"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    <FiCalendar className="mr-2 text-blue-600" /> Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {/* Total Marks */}
                <div className="mb-4">
                  <label
                    htmlFor="totalMarks"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    <BiTimeFive className="mr-2 text-blue-600" /> Total Marks
                  </label>
                  <input
                    type="number"
                    id="totalMarks"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    placeholder="Enter total marks"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {/* Assessment Type */}
                <div className="mb-4">
                  <label
                    htmlFor="assessmentType"
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    <MdAssignment className="mr-2 text-blue-600" /> Assessment Type
                  </label>
                  <select
                    id="assessmentType"
                    name="assessmentType"
                    value={formData.assessmentType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="ISA1">ISA1</option>
                    <option value="ISA2">ISA2</option>
                    <option value="ESA">ESA</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button 
                  type="button" 
                  className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiPlus className="mr-2" /> Create Assignment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 sm:p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiTrash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete Assignment</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Are you sure you want to delete this assignment? This action cannot be undone.
              </p>
              <div className="mt-4 flex flex-col-reverse sm:flex-row justify-center gap-2">
                <button
                  type="button"
                  className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                  onClick={() => handleDeleteAssignment(deleteConfirmation.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;
