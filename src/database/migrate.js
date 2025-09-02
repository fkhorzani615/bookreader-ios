import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import database from './database.js';

// Firebase configuration (you'll need to provide your own)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateData() {
  try {
    console.log('Starting migration from Firebase to SQLite...');
    
    // Initialize SQLite database
    await database.initialize();
    
    // Migrate books
    console.log('Migrating books...');
    const booksSnapshot = await getDocs(collection(db, 'books'));
    const books = booksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    for (const book of books) {
      try {
        await database.createBook({
          id: book.id,
          title: book.title || '',
          author: book.author || '',
          description: book.description || '',
          category: book.category || '',
          cover: book.cover || book.image || '',
          pages: book.pages || 0,
          rating: book.rating || 0,
          price: book.price || 0,
          isPublic: book.isPublic !== false,
          featured: book.featured === true,
          userId: book.userId || book.user_id || '',
          userName: book.userName || book.user_name || '',
          teamId: book.teamId || book.team_id || ''
        });
        console.log(`Migrated book: ${book.title}`);
      } catch (error) {
        console.error(`Error migrating book ${book.title}:`, error);
      }
    }
    
    // Migrate videos
    console.log('Migrating videos...');
    const videosSnapshot = await getDocs(collection(db, 'videos'));
    const videos = videosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    for (const video of videos) {
      try {
        await database.createVideo({
          id: video.id,
          title: video.title || '',
          instructor: video.instructor || '',
          description: video.description || '',
          category: video.category || '',
          thumbnail: video.thumbnail || '',
          videoUrl: video.videoUrl || video.video_url || '',
          duration: video.duration || '',
          rating: video.rating || 0,
          views: video.views || 0,
          isPublic: video.isPublic !== false,
          featured: video.featured === true,
          userId: video.userId || video.user_id || '',
          userName: video.userName || video.user_name || '',
          teamId: video.teamId || video.team_id || ''
        });
        console.log(`Migrated video: ${video.title}`);
      } catch (error) {
        console.error(`Error migrating video ${video.title}:`, error);
      }
    }
    
    // Migrate orders
    console.log('Migrating orders...');
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    for (const order of orders) {
      try {
        await database.createOrder({
          id: order.id,
          userId: order.userId || order.user_id || order.user || '',
          total: order.total || 0,
          status: order.status || 'pending',
          address: order.address || '',
          items: order.items || order.cart || []
        });
        console.log(`Migrated order: ${order.id}`);
      } catch (error) {
        console.error(`Error migrating order ${order.id}:`, error);
      }
    }
    
    console.log('Migration completed successfully!');
    console.log(`Migrated ${books.length} books, ${videos.length} videos, ${orders.length} orders`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData();
}

export default migrateData;
