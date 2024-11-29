import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('enrolled');
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [enrolledRes, availableRes] = await Promise.all([
        api.get('/courses/enrolled'),
        api.get('/courses/available')
      ]);
      setEnrolledCourses(enrolledRes.data);
      setAvailableCourses(availableRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      const courseToEnroll = availableCourses.find(course => course._id === courseId);
      if (courseToEnroll) {
        setEnrolledCourses(prev => [...prev, courseToEnroll]);
        setAvailableCourses(prev => prev.filter(course => course._id !== courseId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error enrolling in course');
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await api.delete(`/courses/${courseId}/unenroll`);
      const courseToUnenroll = enrolledCourses.find(course => course._id === courseId);
      if (courseToUnenroll) {
        setEnrolledCourses(prev => prev.filter(course => course._id !== courseId));
        setAvailableCourses(prev => [...prev, courseToUnenroll]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error unenrolling from course');
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const renderCourseCard = (course, isEnrolled = false) => (
    <div key={course._id} className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-2">{course.title}</h3>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {course.students?.length || 0} students enrolled
        </span>
        <div className="space-x-2">
          <button
            onClick={() => handleViewCourse(course._id)}
            className="btn-secondary"
          >
            View Details
          </button>
          <button
            onClick={() => isEnrolled ? handleUnenroll(course._id) : handleEnroll(course._id)}
            className={isEnrolled ? 'btn-danger' : 'btn-primary'}
          >
            {isEnrolled ? 'Unenroll' : 'Enroll'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = (type) => (
    <div className="text-center py-8">
      <p className="text-gray-500">
        {type === 'enrolled' 
          ? 'You are not enrolled in any courses yet.'
          : 'No available courses found.'}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
        <p className="text-gray-600">Welcome back, {user?.name}! Manage your course enrollments below.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrolled'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Enrolled Courses ({enrolledCourses.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Courses ({availableCourses.length})
            </button>
          </nav>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'enrolled'
              ? (enrolledCourses.length > 0 
                  ? enrolledCourses.map(course => renderCourseCard(course, true))
                  : renderEmptyState('enrolled'))
              : (availableCourses.length > 0
                  ? availableCourses.map(course => renderCourseCard(course))
                  : renderEmptyState('available'))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
