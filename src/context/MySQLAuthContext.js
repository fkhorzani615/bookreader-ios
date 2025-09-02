import React, { createContext, useContext, useState, useEffect } from 'react';

// Configure API base URL for production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://win8126.site4now.net:3001/api' 
  : 'http://localhost:3001/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

const MySQLAuthContext = createContext();

export const useMySQLAuth = () => {
  const context = useContext(MySQLAuthContext);
  if (!context) {
    throw new Error('useMySQLAuth must be used within a MySQLAuthProvider');
  }
  return context;
};

export const MySQLAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          // Verify token is still valid
          const userData = await apiCall('/auth/profile');
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const register = async (email, password, displayName, additionalData = {}) => {
    try {
      setError(null);
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          displayName,
          ...additionalData
        })
      });

      const { user, userProfile } = response;
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(userProfile);
      
      return { success: true, user: userProfile };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password
        })
      });

      const { user, token } = response;
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Get full user profile
      const profileResponse = await apiCall('/auth/profile');
      setCurrentUser(profileResponse);
      
      return { success: true, user: profileResponse };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      setCurrentUser(response);
      return { success: true, user: response };
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!currentUser
  };

  return (
    <MySQLAuthContext.Provider value={value}>
      {children}
    </MySQLAuthContext.Provider>
  );
};
