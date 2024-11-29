import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const CourseDetails = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { courseId } = useParams();
  const navigate = useNavigate();


  const fetchCourseDetails = useCallback(async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching course details');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
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
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{course.title}</h2>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Course Information</h3>
            <div className="space-y-4">
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
                <p className="mt-1 text-2xl font-semibold">{course.students.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Assignments</h4>
                <p className="mt-1 text-2xl font-semibold">{course.assignments.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
