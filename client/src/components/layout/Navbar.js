import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                EduVault
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                {(user.role === 'teacher' || user.role === 'admin') && (
                  <Link
                    to="/teacher"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Teacher Dashboard
                  </Link>
                )}
                
                {user.role === 'student' && (
                  <Link
                    to="/student"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Student Dashboard
                  </Link>
                )}

                <div className="flex items-center ml-4">
                  <span className="text-gray-700 text-sm font-medium mr-4">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
