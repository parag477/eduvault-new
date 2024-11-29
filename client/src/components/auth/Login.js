import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import api from '../../api/axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // useEffect(() => {
  //   // Handle Google OAuth success
  //   const params = new URLSearchParams(location.search);
  //   const token = params.get('token');
  //   if (token) {
  //     handleGoogleSuccess(token);
  //   }
  // }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // const handleGoogleSuccess = async (token) => {
  //   try {
  //     localStorage.setItem('token', token);
      
  //     const response = await api.get('/auth/me');
  //     dispatch(loginSuccess({ token, user: response.data }));
  //     navigate('/dashboard');
  //   } catch (err) {
  //     dispatch(loginFailure('Google login failed'));
  //     console.error('Google login error:', err);
  //   }
  // };

  const handleGoogleSuccess = useCallback(
    async (token) => {
      try {
        localStorage.setItem('token', token);
        const response = await api.get('/auth/me');
        dispatch(loginSuccess({ token, user: response.data }));
        navigate('/dashboard');
      } catch (err) {
        dispatch(loginFailure('Google login failed'));
        console.error('Google login error:', err);
      }
    },
    [dispatch, navigate]
  );

  useEffect(() => {
    // Handle Google OAuth success
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      handleGoogleSuccess(token);
    }
  }, [location, handleGoogleSuccess]);

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    setValidationErrors([]);

    try {
      const response = await api.post('/auth/login', formData);
      dispatch(loginSuccess(response.data));
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        dispatch(loginFailure('Please fix the validation errors'));
      } else {
        dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
      }
      console.error('Login error:', err.response?.data);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || validationErrors.length > 0) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  {validationErrors.length > 0 && (
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {validationErrors.map((err, index) => (
                          <li key={index}>{err.msg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
              />
              Sign in with Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
