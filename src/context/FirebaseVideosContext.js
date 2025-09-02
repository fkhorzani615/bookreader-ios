import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';

const FirebaseVideosContext = createContext();

export const useFirebaseVideos = () => {
  const context = useContext(FirebaseVideosContext);
  if (!context) {
    throw new Error('useFirebaseVideos must be used within a FirebaseVideosProvider');
  }
  return context;
};

export const FirebaseVideosProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let videosQuery = collection(db, 'videos');
      
      // Apply filters
      if (filters.isPublic !== undefined) {
        videosQuery = query(videosQuery, where('isPublic', '==', filters.isPublic));
      }
      if (filters.featured !== undefined) {
        videosQuery = query(videosQuery, where('featured', '==', filters.featured));
      }
      if (filters.category) {
        videosQuery = query(videosQuery, where('category', '==', filters.category));
      }
      if (filters.userId) {
        videosQuery = query(videosQuery, where('userId', '==', filters.userId));
      }
      
      // Add ordering
      videosQuery = query(videosQuery, orderBy('createdAt', 'desc'));
      
      const videosSnapshot = await getDocs(videosQuery);
      let videosData = videosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no videos in Firebase, add sample data
      if (videosData.length === 0) {
        console.log('No videos found in Firebase, adding sample data...');
        videosData = [
          {
            id: 'sample-video-1',
            title: 'React Fundamentals',
            description: 'Learn the basics of React.js including components, props, state, and hooks.',
            category: 'Programming',
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            duration: '2:15:30',
            isPublic: true,
            featured: true,
            views: 15420,
            likes: 892,
            tags: ['react', 'javascript', 'frontend'],
            userId: 'sample-user',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'sample-video-2',
            title: 'Machine Learning Basics',
            description: 'Introduction to machine learning concepts and algorithms.',
            category: 'Data Science',
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            duration: '3:45:12',
            isPublic: true,
            featured: true,
            views: 8920,
            likes: 567,
            tags: ['machine learning', 'ai', 'data science'],
            userId: 'sample-user',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'sample-video-3',
            title: 'UI/UX Design Principles',
            description: 'Master the fundamental principles of user interface and user experience design.',
            category: 'Design',
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            duration: '1:52:45',
            isPublic: true,
            featured: false,
            views: 6780,
            likes: 423,
            tags: ['ui design', 'ux design', 'design principles'],
            userId: 'sample-user',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'sample-video-4',
            title: 'Digital Marketing Strategy',
            description: 'Develop effective digital marketing strategies for your business.',
            category: 'Marketing',
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            duration: '2:30:18',
            isPublic: true,
            featured: true,
            views: 12340,
            likes: 756,
            tags: ['digital marketing', 'strategy', 'business'],
            userId: 'sample-user',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'sample-video-5',
            title: 'Productivity Hacks',
            description: 'Learn powerful productivity techniques to maximize your efficiency.',
            category: 'Personal Development',
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            duration: '1:15:30',
            isPublic: true,
            featured: false,
            views: 4560,
            likes: 289,
            tags: ['productivity', 'time management', 'personal development'],
            userId: 'sample-user',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
      }
      
      setVideos(videosData);
      return videosData;
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
      
      const videoDoc = await getDoc(doc(db, 'videos', id));
      if (!videoDoc.exists()) {
        throw new Error('Video not found');
      }
      
      return {
        id: videoDoc.id,
        ...videoDoc.data()
      };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch video';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadVideoFile = async (file, userId) => {
    try {
      const fileName = `videos/${userId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      throw new Error(`Failed to upload video file: ${error.message}`);
    }
  };

  const createVideo = async (videoData, userId) => {
    try {
      setLoading(true);
      setError(null);
      
      let videoUrl = videoData.videoUrl;
      
      // Upload video file if provided
      if (videoData.videoFile) {
        videoUrl = await uploadVideoFile(videoData.videoFile, userId);
      }
      
      const videoDoc = {
        title: videoData.title,
        description: videoData.description,
        category: videoData.category,
        videoUrl: videoUrl,
        thumbnailUrl: videoData.thumbnailUrl || '',
        duration: videoData.duration || 0,
        isPublic: videoData.isPublic !== undefined ? videoData.isPublic : true,
        featured: videoData.featured || false,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        likes: 0,
        tags: videoData.tags || []
      };
      
      const docRef = await addDoc(collection(db, 'videos'), videoDoc);
      const newVideo = {
        id: docRef.id,
        ...videoDoc
      };
      
      // Add new video to the list
      setVideos(prevVideos => [newVideo, ...prevVideos]);
      
      return newVideo;
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
      
      const updateData = {
        ...videoData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'videos', id), updateData);
      
      // Update video in the list
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === id ? { ...video, ...updateData } : video
        )
      );
      
      return { id, ...updateData };
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
      
      // Get video data to delete associated files
      const videoDoc = await getDoc(doc(db, 'videos', id));
      if (videoDoc.exists()) {
        const videoData = videoDoc.data();
        
        // Delete video file from storage if it exists
        if (videoData.videoUrl && videoData.videoUrl.includes('firebasestorage')) {
          try {
            const videoRef = ref(storage, videoData.videoUrl);
            await deleteObject(videoRef);
          } catch (storageError) {
            console.warn('Failed to delete video file from storage:', storageError);
          }
        }
        
        // Delete thumbnail if it exists
        if (videoData.thumbnailUrl && videoData.thumbnailUrl.includes('firebasestorage')) {
          try {
            const thumbnailRef = ref(storage, videoData.thumbnailUrl);
            await deleteObject(thumbnailRef);
          } catch (storageError) {
            console.warn('Failed to delete thumbnail from storage:', storageError);
          }
        }
      }
      
      await deleteDoc(doc(db, 'videos', id));
      
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

  const incrementViews = async (videoId) => {
    try {
      const videoRef = doc(db, 'videos', videoId);
      await updateDoc(videoRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Real-time listener for videos
  useEffect(() => {
    console.log('Setting up real-time listener for videos...');
    
    const unsubscribe = onSnapshot(
      collection(db, "videos"),
      (snapshot) => {
        console.log('Videos snapshot received:', snapshot.size, 'videos');
        const videosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Processed videos data:', videosData);
        setVideos(videosData);
        setLoading(false); // Ensure loading is set to false when data is received
      },
      (error) => {
        console.error('Error listening to videos:', error);
        setError('Failed to listen to videos updates');
        setLoading(false); // Ensure loading is set to false on error
      }
    );

    return () => {
      console.log('Cleaning up videos listener...');
      unsubscribe();
    };
  }, []);

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
    incrementViews,
    clearError
  };

  return (
    <FirebaseVideosContext.Provider value={value}>
      {children}
    </FirebaseVideosContext.Provider>
  );
};
