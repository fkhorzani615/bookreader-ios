const fs = require('fs');
const path = require('path');
const database = require('./src/database/database.js');

async function testSQLiteSetup() {
  try {
    console.log('🚀 Testing SQLite Setup...');
    
    // Initialize database
    await database.initialize();
    console.log('✅ Database initialized successfully');
    
    // Create a test user (or get existing one)
    console.log('👤 Creating test user...');
    let testUser;
    try {
      testUser = await database.createUser(
        'test@example.com',
        'password123',
        'Test User',
        {
          phone: '+1234567890',
          location: 'Test City',
          bio: 'This is a test user for SQLite migration'
        }
      );
      console.log('✅ Test user created:', testUser.user.email);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Test user already exists, using existing user');
        // Get the existing user
        const authResult = await database.authenticateUser('test@example.com', 'password123');
        testUser = { user: { uid: authResult.uid, email: authResult.email, displayName: authResult.displayName } };
      } else {
        throw error;
      }
    }
    
    // Create some sample books
    console.log('📚 Creating sample books...');
    const sampleBooks = [
      {
        title: 'The Art of Programming',
        author: 'John Doe',
        description: 'A comprehensive guide to programming fundamentals',
        category: 'Programming',
        cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
        pages: 350,
        rating: 4.5,
        price: 29.99,
        is_public: true,
        featured: true,
        user_id: testUser.user.uid,
        user_name: 'Test User'
      },
      {
        title: 'Data Science Fundamentals',
        author: 'Jane Smith',
        description: 'Learn the basics of data science and machine learning',
        category: 'Data Science',
        cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        pages: 420,
        rating: 4.8,
        price: 39.99,
        is_public: true,
        featured: true,
        user_id: testUser.user.uid,
        user_name: 'Test User'
      },
      {
        title: 'Design Principles',
        author: 'Mike Johnson',
        description: 'Master the principles of good design',
        category: 'Design',
        cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
        pages: 280,
        rating: 4.2,
        price: 24.99,
        is_public: true,
        featured: false,
        user_id: testUser.user.uid,
        user_name: 'Test User'
      }
    ];
    
    for (const bookData of sampleBooks) {
      const book = await database.createBook(bookData);
      console.log(`✅ Created book: ${book.title}`);
    }
    
    // Create some sample videos
    console.log('🎥 Creating sample videos...');
    const sampleVideos = [
      {
        title: 'Introduction to React',
        instructor: 'Sarah Wilson',
        description: 'Learn React fundamentals in this comprehensive tutorial',
        category: 'Programming',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
        video_url: 'https://example.com/video1.mp4',
        duration: '01:30:00',
        rating: 4.6,
        views: 1250,
        is_public: true,
        featured: true,
        user_id: testUser.user.uid,
        user_name: 'Test User'
      },
      {
        title: 'Machine Learning Basics',
        instructor: 'David Chen',
        description: 'Understanding machine learning concepts and algorithms',
        category: 'Data Science',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        video_url: 'https://example.com/video2.mp4',
        duration: '02:15:00',
        rating: 4.9,
        views: 2100,
        is_public: true,
        featured: true,
        user_id: testUser.user.uid,
        user_name: 'Test User'
      },
      {
        title: 'UI/UX Design Principles',
        instructor: 'Lisa Brown',
        description: 'Learn essential design principles for better user experience',
        category: 'Design',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
        video_url: 'https://example.com/video3.mp4',
        duration: '01:45:00',
        rating: 4.3,
        views: 890,
        is_public: true,
        featured: false,
        user_id: testUser.user.uid,
        user_name: 'Test User'
      }
    ];
    
    for (const videoData of sampleVideos) {
      const video = await database.createVideo(videoData);
      console.log(`✅ Created video: ${video.title}`);
    }
    
    // Test fetching data
    console.log('📊 Testing data retrieval...');
    const books = await database.getBooks();
    const videos = await database.getVideos();
    const categories = await database.getCategories();
    
    console.log(`✅ Retrieved ${books.length} books`);
    console.log(`✅ Retrieved ${videos.length} videos`);
    console.log(`✅ Retrieved ${categories.length} categories`);
    
    // Test authentication
    console.log('🔐 Testing authentication...');
    const loginResult = await database.authenticateUser('test@example.com', 'password123');
    console.log('✅ Login successful:', loginResult.email);
    
    console.log('\n🎉 SQLite setup test completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\n💡 You can now test the application with these credentials');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSQLiteSetup();
