import React, { createContext, useContext, useEffect, useState } from 'react';
import database from '../database/database';

const SQLiteAuthContext = createContext();

export const useSQLiteAuth = () => {
  const context = useContext(SQLiteAuthContext);
  if (!context) {
    throw new Error('useSQLiteAuth must be used within an SQLiteAuthProvider');
  }
  return context;
};

export const SQLiteAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);

  // Initialize authentication context
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = localStorage.getItem('bookreader_token');
    if (token) {
      try {
        // Set token in database client
        database.setToken(token);
        
        // Validate session with SQLite API
        const user = await database.validateSession(token);
        if (user) {
          setCurrentUser(user);
          const profile = await database.getUserProfile(user.uid);
          setUserProfile(profile);
        } else {
          localStorage.removeItem('bookreader_token');
          database.setToken(null);
        }
      } catch (error) {
        console.error('Session validation error:', error);
        localStorage.removeItem('bookreader_token');
        database.setToken(null);
      }
    }
    setLoading(false);
  };

  const signup = async (email, password, displayName, additionalData = {}) => {
    try {
      // Use the SQLite API to create the user
      const response = await database.createUser(email, password, displayName, additionalData);
      
      // Set current user from response
      setCurrentUser(response.user);
      setUserProfile(response.userProfile);
      
      // Store auth token if provided
      if (response.token) {
        localStorage.setItem('bookreader_token', response.token);
        database.setToken(response.token);
      }
      setError(null);

      return response;
    } catch (error) {
      setError(error.message);
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      // Use the SQLite API to authenticate the user
      const response = await database.authenticateUser(email, password);
      
      // Set current user from response
      setCurrentUser(response.user);
      setError(null);
      
      // Store auth token if provided
      if (response.token) {
        localStorage.setItem('bookreader_token', response.token);
        database.setToken(response.token);
      }
      
      // Get user profile
      const profile = await database.getUserProfile(response.user.uid);
      setUserProfile(profile);

      return response.user;
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('bookreader_token');
      if (token) {
        await database.deleteSession();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('bookreader_token');
    database.setToken(null);
    setCurrentUser(null);
    setUserProfile(null);
    setError(null);
  };

  const resetPassword = async (email) => {
    try {
      const users = JSON.parse(localStorage.getItem('bookreader_users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('No account found with this email address.');
      }

      // In a real app, you would send an email here
      // For demo purposes, we'll just return success
      return { email };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (!currentUser) throw new Error('No user logged in');

      // Use the SQLite API to update user profile
      const updatedProfile = await database.updateUserProfile(updates);
      setUserProfile(updatedProfile);
      setError(null);
      
      return updatedProfile;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const fetchUserProfile = async (uid) => {
    try {
      const users = JSON.parse(localStorage.getItem('bookreader_users') || '[]');
      const user = users.find(u => u.uid === uid);
      return user || null;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    fetchUserProfile,
    loading,
    error,
    isConfigured: true
  };

  return (
    <SQLiteAuthContext.Provider value={value}>
      {!loading && children}
    </SQLiteAuthContext.Provider>
  );
};
