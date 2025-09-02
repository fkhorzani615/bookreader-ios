import React, { useEffect, useState, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

const SQLiteVideosContext = React.createContext();

const SQLiteVideosProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Fetch all videos from MySQL API
      const response = await fetch('http://localhost:3001/api/videos?isPublic=true');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const videosData = await response.json();
      
      // Filter featured videos
      const featured = videosData.filter((video) => {
        return !!video.featured;
      });
      
      setVideos(videosData);
      setFeatured(featured);
      setLoading(false);
    } catch (err) {
      console.log('Error fetching videos:', err);
      setLoading(false);
    }
  };

  const createVideo = async (videoData) => {
    try {
      const response = await fetch('http://localhost:3001/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(videoData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create video');
      }
      
      const newVideo = await response.json();
      setVideos(prev => [newVideo, ...prev]);
      return newVideo;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  };

  const updateVideo = async (videoId, videoData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(videoData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update video');
      }
      
      const updatedVideo = await response.json();
      setVideos(prev => prev.map(video => video.id === videoId ? updatedVideo : video));
      return updatedVideo;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete video');
      }
      
      setVideos(prev => prev.filter(video => video.id !== videoId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  };

  const getVideo = async (videoId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/videos/${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching video:', error);
      return null;
    }
  };

  const value = { 
    videos, 
    featured, 
    loading, 
    fetchVideos, 
    createVideo, 
    updateVideo,
    deleteVideo,
    getVideo 
  };

  return (
    <SQLiteVideosContext.Provider value={value}>
      {children}
    </SQLiteVideosContext.Provider>
  );
};

// Custom hook to use the SQLiteVideos context
const useSQLiteVideos = () => {
  const context = useContext(SQLiteVideosContext);
  if (!context) {
    throw new Error('useSQLiteVideos must be used within a SQLiteVideosProvider');
  }
  return context;
};

export { SQLiteVideosProvider, useSQLiteVideos };
export default SQLiteVideosContext;
