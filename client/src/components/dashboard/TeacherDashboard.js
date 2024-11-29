import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSelector } from 'react-redux';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses/teaching');
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching courses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', newCourse);
      setNewCourse({
        title: '',
        description: '',
        startDate: '',
        endDate: ''
      });
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating course');
    }
  };

  const handleViewDetails = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleManageCourse = (courseId) => {
    navigate(`/courses/${courseId}/manage`);
  };

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
        <h2 className="text-2xl font-bold mb-4">Teacher Dashboard</h2>
        <p className="text-gray-600">Welcome back, {user?.name}! Manage your courses below.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Create New Course</h3>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div>
            <label htmlFor="title" className="form-label">Course Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newCourse.title}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={newCourse.description}
              onChange={handleInputChange}
              className="input-field"
              rows="3"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="form-label">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={newCourse.startDate}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="form-label">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={newCourse.endDate}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Create Course
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Your Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium mb-2">{course.title}</h4>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Students: {course.students?.length || 0}</span>
                <span>Assignments: {course.assignments?.length || 0}</span>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  onClick={() => handleViewDetails(course._id)}
                  className="btn-secondary"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleManageCourse(course._id)}
                  className="btn-primary"
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
