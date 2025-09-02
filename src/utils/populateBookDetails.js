import { db } from '../firebase/config';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { createSampleBookDetails } from './bookDetailsUtils';

export const populateBookDetails = async () => {
  try {
    console.log('Starting to populate book details...');
    
    // Get all books from Firebase
    const booksSnapshot = await getDocs(collection(db, 'books'));
    const books = booksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${books.length} books to process`);
    
    // Get existing book details to avoid duplicates
    const bookDetailsSnapshot = await getDocs(collection(db, 'bookDetails'));
    const existingBookIds = bookDetailsSnapshot.docs.map(doc => doc.data().bookId);
    
    console.log(`Found ${existingBookIds.length} existing book details`);
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const book of books) {
      // Skip if book details already exist
      if (existingBookIds.includes(book.id)) {
        console.log(`Skipping book "${book.title}" - details already exist`);
        skippedCount++;
        continue;
      }
      
      try {
        // Create sample book details
        const bookDetailsData = createSampleBookDetails(book.id, book);
        
        // Add to Firebase
        await addDoc(collection(db, 'bookDetails'), {
          ...bookDetailsData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log(`Created book details for "${book.title}"`);
        createdCount++;
        
        // Add a small delay to avoid overwhelming Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error creating book details for "${book.title}":`, error);
      }
    }
    
    console.log(`\nPopulation complete!`);
    console.log(`Created: ${createdCount} book details`);
    console.log(`Skipped: ${skippedCount} books (details already existed)`);
    console.log(`Total processed: ${books.length} books`);
    
    return {
      created: createdCount,
      skipped: skippedCount,
      total: books.length
    };
    
  } catch (error) {
    console.error('Error populating book details:', error);
    throw error;
  }
};

// Function to check if book details exist for a specific book
export const checkBookDetailsExist = async (bookId) => {
  try {
    const bookDetailsSnapshot = await getDocs(collection(db, 'bookDetails'));
    const existingBookIds = bookDetailsSnapshot.docs.map(doc => doc.data().bookId);
    return existingBookIds.includes(bookId);
  } catch (error) {
    console.error('Error checking book details existence:', error);
    return false;
  }
};

// Function to get statistics about book details
export const getBookDetailsStats = async () => {
  try {
    const booksSnapshot = await getDocs(collection(db, 'books'));
    const bookDetailsSnapshot = await getDocs(collection(db, 'bookDetails'));
    
    const totalBooks = booksSnapshot.size;
    const totalBookDetails = bookDetailsSnapshot.size;
    const existingBookIds = bookDetailsSnapshot.docs.map(doc => doc.data().bookId);
    
    return {
      totalBooks,
      totalBookDetails,
      coverage: totalBooks > 0 ? ((totalBookDetails / totalBooks) * 100).toFixed(1) : 0,
      missingDetails: totalBooks - totalBookDetails
    };
  } catch (error) {
    console.error('Error getting book details stats:', error);
    throw error;
  }
};

// Function to create book details for a specific book
export const createBookDetailsForBook = async (bookId, bookData) => {
  try {
    const bookDetailsData = createSampleBookDetails(bookId, bookData);
    
    const docRef = await addDoc(collection(db, 'bookDetails'), {
      ...bookDetailsData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`Created book details for book ${bookId} with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error creating book details for specific book:', error);
    throw error;
  }
};


