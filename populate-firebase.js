const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxql4hc82vl-G_IMZEnzheo9G7QEhcKeQ",
  authDomain: "bookreader-54669.firebaseapp.com",
  projectId: "bookreader-54669",
  storageBucket: "bookreader-54669.firebasestorage.app",
  messagingSenderId: "63194010598",
  appId: "1:63194010598:web:9eece40255c07d4d807c27",
  measurementId: "G-CB53QKSR8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample categories data
const sampleCategories = [
  {
    name: 'Programming',
    description: 'Learn coding and software development',
    color: '#3B82F6',
    icon: '💻',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'Data Science',
    description: 'Master data analysis and machine learning',
    color: '#10B981',
    icon: '📊',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'Design',
    description: 'Create beautiful user interfaces and experiences',
    color: '#F59E0B',
    icon: '🎨',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'Business',
    description: 'Develop business skills and entrepreneurship',
    color: '#8B5CF6',
    icon: '💼',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'Marketing',
    description: 'Learn digital marketing and growth strategies',
    color: '#EF4444',
    icon: '📈',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'Personal Development',
    description: 'Improve yourself and achieve your goals',
    color: '#06B6D4',
    icon: '🚀',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Sample videos data
const sampleVideos = [
  {
    title: 'React Fundamentals',
    description: 'Learn the basics of React.js including components, props, state, and hooks.',
    category: 'Programming',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    duration: '2:15:30',
    instructor: 'John Doe',
    isPublic: true,
    featured: true,
    views: 15420,
    likes: 892,
    rating: 4.8,
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
    instructor: 'Jane Smith',
    isPublic: true,
    featured: true,
    views: 8920,
    likes: 567,
    rating: 4.7,
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
    instructor: 'Mike Johnson',
    isPublic: true,
    featured: false,
    views: 6780,
    likes: 423,
    rating: 4.6,
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
    instructor: 'Sarah Wilson',
    isPublic: true,
    featured: true,
    views: 12340,
    likes: 756,
    rating: 4.5,
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
    instructor: 'Alex Brown',
    isPublic: true,
    featured: false,
    views: 4560,
    likes: 289,
    rating: 4.4,
    tags: ['productivity', 'time management', 'personal development'],
    userId: 'sample-user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Sample books data
const sampleBooks = [
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    description: 'A comprehensive guide to software development best practices and career growth.',
    category: 'Programming',
    price: 29.99,
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    isPublic: true,
    featured: true,
    rating: 4.8,
    pages: 352,
    tags: ['programming', 'software development', 'best practices'],
    userId: 'sample-user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    description: 'Learn how to write clean, maintainable, and professional code.',
    category: 'Programming',
    price: 34.99,
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    isPublic: true,
    featured: true,
    rating: 4.7,
    pages: 464,
    tags: ['clean code', 'programming', 'software engineering'],
    userId: 'sample-user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: 'Python for Data Analysis',
    author: 'Wes McKinney',
    description: 'Master data manipulation and analysis with Python and pandas.',
    category: 'Data Science',
    price: 39.99,
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    isPublic: true,
    featured: true,
    rating: 4.6,
    pages: 523,
    tags: ['python', 'data analysis', 'pandas'],
    userId: 'sample-user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: 'Don\'t Make Me Think',
    author: 'Steve Krug',
    description: 'A common sense approach to web usability and user experience design.',
    category: 'Design',
    price: 24.99,
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    isPublic: true,
    featured: true,
    rating: 4.5,
    pages: 216,
    tags: ['usability', 'ux design', 'web design'],
    userId: 'sample-user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    description: 'Learn how to build successful startups using lean methodology.',
    category: 'Business',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    pdfUrl: '',
    isPublic: true,
    featured: true,
    rating: 4.4,
    pages: 336,
    tags: ['startup', 'entrepreneurship', 'lean methodology'],
    userId: 'sample-user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Function to populate the database
async function populateDatabase() {
  try {
    console.log('Starting to populate Firebase database...');

    // Add categories
    console.log('Adding categories...');
    for (const category of sampleCategories) {
      await addDoc(collection(db, 'categories'), category);
      console.log(`Added category: ${category.name}`);
    }

    // Add videos
    console.log('Adding videos...');
    for (const video of sampleVideos) {
      await addDoc(collection(db, 'videos'), video);
      console.log(`Added video: ${video.title}`);
    }

    // Add books
    console.log('Adding books...');
    for (const book of sampleBooks) {
      await addDoc(collection(db, 'books'), book);
      console.log(`Added book: ${book.title}`);
    }

    console.log('Database population completed successfully!');
    console.log(`Added ${sampleCategories.length} categories, ${sampleVideos.length} videos, and ${sampleBooks.length} books.`);
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

// Run the population script
populateDatabase();
