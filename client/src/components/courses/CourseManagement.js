import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axios';

const CourseManagement = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // useEffect(() => {
  //   fetchCourseDetails();
  // }, [courseId, user]);

  const fetchCourseDetails = useCallback(async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        startDate: response.data.startDate.split('T')[0],
        endDate: response.data.endDate.split('T')[0],
      });
    } catch (err) {
      console.error('Fetch course error:', err);
      setError(err.response?.data?.message || 'Error fetching course details');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/courses/${courseId}`, formData);
      if (response.status === 200) {
        setEditMode(false);
        fetchCourseDetails();
      }
    } catch (err) {
      console.error('Update course error:', err);
      setError(err.response?.data?.message || 'Error updating course');
    }
  };

  const handleDeleteCourse = async () => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        if (!course || !user) {
          setError('Course or user data not found');
          return;
        }

        const instructorId = course.instructor._id;
        const userId = user.id;
        const isInstructor = instructorId === userId;
        const isAdmin = user.role === 'admin';

        if (!isInstructor && !isAdmin) {
          setError('You do not have permission to delete this course');
          return;
        }

        const response = await api.delete(`/courses/${courseId}`);
        if (response.status === 200) {
          navigate('/teacher');
        } else {
          setError('Failed to delete course. Please try again.');
        }
      } catch (err) {
        console.error('Delete course error:', err);
        const errorMessage = err.response?.data?.message || 'Error deleting course. Please check if you have permission to delete this course.';
        setError(errorMessage);
        
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <button
            onClick={() => navigate('/teacher')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Course</h2>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/teacher')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
            {!editMode && (course.instructor._id === user.id || user.role === 'admin') && (
              <button
                onClick={() => setEditMode(true)}
                className="btn-primary"
              >
                Edit Course
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="form-label">Course Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
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
                value={formData.description}
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
                  value={formData.startDate}
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
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Course Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Title</h4>
                  <p className="mt-1">{course.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-1">{course.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                    <p className="mt-1">{new Date(course.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">End Date</h4>
                    <p className="mt-1">{new Date(course.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Course Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Enrolled Students</h4>
                  <p className="mt-1 text-2xl font-semibold">{course.students?.length || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Assignments</h4>
                  <p className="mt-1 text-2xl font-semibold">{course.assignments?.length || 0}</p>
                </div>
              </div>
            </div>

            {(course.instructor._id === user.id || user.role === 'admin') && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                <button
                  onClick={handleDeleteCourse}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Delete Course
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
