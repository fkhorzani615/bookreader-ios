import { db } from '../firebase/config';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Function to check if videos exist in Firebase
export const checkVideosExist = async () => {
  try {
    console.log('Checking for videos in Firebase...');
    const videosSnapshot = await getDocs(collection(db, 'videos'));
    console.log(`Found ${videosSnapshot.size} videos in Firebase`);
    
    const videos = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      exists: videosSnapshot.size > 0,
      count: videosSnapshot.size,
      videos: videos
    };
  } catch (error) {
    console.error('Error checking videos:', error);
    return {
      exists: false,
      count: 0,
      videos: [],
      error: error.message
    };
  }
};

// Function to populate sample videos
export const populateSampleVideos = async () => {
  try {
    console.log('Populating sample videos...');
    
    const sampleVideos = [
      {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    let createdCount = 0;
    
    for (const video of sampleVideos) {
      try {
        await addDoc(collection(db, 'videos'), video);
        console.log(`Created video: ${video.title}`);
        createdCount++;
        
        // Add a small delay to avoid overwhelming Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error creating video "${video.title}":`, error);
      }
    }
    
    console.log(`Successfully created ${createdCount} sample videos`);
    return { created: createdCount, total: sampleVideos.length };
    
  } catch (error) {
    console.error('Error populating sample videos:', error);
    throw error;
  }
};

// Function to get video statistics
export const getVideoStats = async () => {
  try {
    const videosSnapshot = await getDocs(collection(db, 'videos'));
    const videos = videosSnapshot.docs.map(doc => doc.data());
    
    const stats = {
      total: videos.length,
      public: videos.filter(v => v.isPublic).length,
      featured: videos.filter(v => v.featured).length,
      categories: [...new Set(videos.map(v => v.category).filter(Boolean))],
      totalViews: videos.reduce((sum, v) => sum + (v.views || 0), 0),
      totalLikes: videos.reduce((sum, v) => sum + (v.likes || 0), 0)
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting video stats:', error);
    throw error;
  }
};

// Function to debug Firebase connection
export const debugFirebaseConnection = async () => {
  try {
    console.log('Debugging Firebase connection...');
    
    // Test Firestore connection
    const testSnapshot = await getDocs(collection(db, 'videos'));
    console.log('Firestore connection successful');
    console.log('Videos collection accessible');
    console.log(`Found ${testSnapshot.size} documents in videos collection`);
    
    return {
      success: true,
      videosCount: testSnapshot.size,
      message: 'Firebase connection is working correctly'
    };
  } catch (error) {
    console.error('Firebase connection error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Firebase connection failed'
    };
  }
};


