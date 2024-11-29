import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from './store/slices/authSlice';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
// import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import CourseDetails from './components/courses/CourseDetails';
import CourseManagement from './components/courses/CourseManagement';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'teacher':
        return <Navigate to="/teacher/dashboard" />;
      default:
        return <Navigate to="/student/dashboard" />;
    }
  }

  return children;
};

const AuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      dispatch(loginSuccess({ token }));
      
      const cleanPath = location.pathname;
      navigate(cleanPath, { replace: true });
    }
  }, [location, navigate, dispatch]);

  return null;
};

function App() {
  const { user } = useSelector((state) => state.auth);

  const getDefaultDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'teacher':
        return <Navigate to="/teacher/dashboard" />;
      default:
        return <Navigate to="/student/dashboard" />;
    }
  };

  return (
    <Router>
      <AuthHandler />
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student/dashboard" element={<PrivateRoute allowedRoles={['student']}><StudentDashboard /></PrivateRoute>} />
            <Route path="/teacher/dashboard" element={<PrivateRoute allowedRoles={['teacher', 'admin']}><TeacherDashboard /></PrivateRoute>} />
            <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
            <Route path="/courses/:courseId" element={ <PrivateRoute><CourseDetails /></PrivateRoute>} />
            <Route path="/courses/:courseId/manage" element={<PrivateRoute allowedRoles={['teacher', 'admin']}><CourseManagement /></PrivateRoute>} />
            <Route path="/dashboard" element={getDefaultDashboard()} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={getDefaultDashboard()} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
