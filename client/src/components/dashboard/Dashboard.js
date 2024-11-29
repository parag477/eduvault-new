import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'teacher':
        return <Navigate to="/teacher" />;
      case 'student':
        return <Navigate to="/student" />;
      default:
        break;
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Welcome to EduVault</h2>
      <p>Loading your dashboard...</p>
    </div>
  );
};

export default Dashboard;
