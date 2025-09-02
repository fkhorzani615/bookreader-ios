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

// Helper function for file uploads
const uploadFile = async (endpoint, formData) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: formData
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

const MySQLVideosContext = createContext();

export const useMySQLVideos = () => {
  const context = useContext(MySQLVideosContext);
  if (!context) {
    throw new Error('useMySQLVideos must be used within a MySQLVideosProvider');
  }
  return context;
};

export const MySQLVideosProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });

      const data = await apiCall(`/videos?${params.toString()}`);
      setVideos(data);
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch videos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getVideo = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall(`/videos/${id}`);
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch video';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createVideo = async (videoData) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Add text fields
      Object.keys(videoData).forEach(key => {
        if (key !== 'videoFile') {
          formData.append(key, videoData[key]);
        }
      });
      
      // Add video file if it exists
      if (videoData.videoFile) {
        formData.append('videoFile', videoData.videoFile);
      }

      const data = await uploadFile('/videos', formData);
      
      // Add new video to the list
      setVideos(prevVideos => [data, ...prevVideos]);
      
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to create video';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateVideo = async (id, videoData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall(`/videos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(videoData)
      });
      
      // Update video in the list
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === id ? data : video
        )
      );
      
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to update video';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiCall(`/videos/${id}`, {
        method: 'DELETE'
      });
      
      // Remove video from the list
      setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
      
      return true;
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete video';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPublicVideos = async () => {
    return fetchVideos({ isPublic: true });
  };

  const getFeaturedVideos = async () => {
    return fetchVideos({ featured: true });
  };

  const getVideosByCategory = async (category) => {
    return fetchVideos({ category, isPublic: true });
  };

  const getUserVideos = async (userId) => {
    return fetchVideos({ userId });
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    videos,
    loading,
    error,
    fetchVideos,
    getVideo,
    createVideo,
    updateVideo,
    deleteVideo,
    getPublicVideos,
    getFeaturedVideos,
    getVideosByCategory,
    getUserVideos,
    clearError
  };

  return (
    <MySQLVideosContext.Provider value={value}>
      {children}
    </MySQLVideosContext.Provider>
  );
};
