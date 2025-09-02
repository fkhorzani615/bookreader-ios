import React, { useEffect, useState, createContext, useContext } from "react";
import { db } from "../firebase/config";
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
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";

const FirebaseBookDetailsContext = createContext();

export const useFirebaseBookDetails = () => {
  const context = useContext(FirebaseBookDetailsContext);
  if (!context) {
    throw new Error('useFirebaseBookDetails must be used within a FirebaseBookDetailsProvider');
  }
  return context;
};

export const FirebaseBookDetailsProvider = ({ children }) => {
  const [bookDetails, setBookDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all book details
  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const bookDetailsQuery = query(
        collection(db, "bookDetails"), 
        orderBy('createdAt', 'desc')
      );
      
      const bookDetailsSnapshot = await getDocs(bookDetailsQuery);
      const bookDetailsData = bookDetailsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBookDetails(bookDetailsData);
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError('Failed to fetch book details');
    } finally {
      setLoading(false);
    }
  };

  // Get book details by book ID
  const getBookDetailsByBookId = async (bookId) => {
    try {
      setLoading(true);
      setError(null);
      
      const bookDetailsQuery = query(
        collection(db, "bookDetails"), 
        where("bookId", "==", bookId)
      );
      
      const bookDetailsSnapshot = await getDocs(bookDetailsQuery);
      
      if (bookDetailsSnapshot.empty) {
        return null;
      }
      
      const bookDetailDoc = bookDetailsSnapshot.docs[0];
      return {
        id: bookDetailDoc.id,
        ...bookDetailDoc.data()
      };
    } catch (err) {
      console.error('Error fetching book details by book ID:', err);
      setError('Failed to fetch book details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get book details by ID
  const getBookDetailsById = async (detailsId) => {
    try {
      setLoading(true);
      setError(null);
      
      const bookDetailDoc = await getDoc(doc(db, 'bookDetails', detailsId));
      
      if (!bookDetailDoc.exists()) {
        return null;
      }
      
      return {
        id: bookDetailDoc.id,
        ...bookDetailDoc.data()
      };
    } catch (err) {
      console.error('Error fetching book details by ID:', err);
      setError('Failed to fetch book details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create new book details
  const createBookDetails = async (bookDetailsData, bookId) => {
    try {
      setLoading(true);
      setError(null);
      
      const bookDetailDoc = {
        bookId: bookId,
        summary: bookDetailsData.summary || '',
        chapters: bookDetailsData.chapters || [],
        tableOfContents: bookDetailsData.tableOfContents || [],
        authorBio: bookDetailsData.authorBio || '',
        publicationDate: bookDetailsData.publicationDate || new Date(),
        isbn: bookDetailsData.isbn || '',
        publisher: bookDetailsData.publisher || '',
        language: bookDetailsData.language || 'English',
        pageCount: bookDetailsData.pageCount || 0,
        format: bookDetailsData.format || 'Paperback',
        dimensions: bookDetailsData.dimensions || '',
        weight: bookDetailsData.weight || '',
        readingLevel: bookDetailsData.readingLevel || 'General',
        awards: bookDetailsData.awards || [],
        reviews: bookDetailsData.reviews || [],
        relatedBooks: bookDetailsData.relatedBooks || [],
        tags: bookDetailsData.tags || [],
        metadata: bookDetailsData.metadata || {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'bookDetails'), bookDetailDoc);
      const newBookDetails = {
        id: docRef.id,
        ...bookDetailDoc
      };
      
      // Add to local state
      setBookDetails(prevDetails => [newBookDetails, ...prevDetails]);
      
      return newBookDetails;
    } catch (err) {
      console.error('Error creating book details:', err);
      setError('Failed to create book details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update book details
  const updateBookDetails = async (detailsId, bookDetailsData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        ...bookDetailsData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'bookDetails', detailsId), updateData);
      
      // Update in local state
      setBookDetails(prevDetails => 
        prevDetails.map(detail => 
          detail.id === detailsId 
            ? { ...detail, ...updateData }
            : detail
        )
      );
      
      return { id: detailsId, ...updateData };
    } catch (err) {
      console.error('Error updating book details:', err);
      setError('Failed to update book details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete book details
  const deleteBookDetails = async (detailsId) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteDoc(doc(db, 'bookDetails', detailsId));
      
      // Remove from local state
      setBookDetails(prevDetails => 
        prevDetails.filter(detail => detail.id !== detailsId)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting book details:', err);
      setError('Failed to delete book details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add review to book details
  const addReview = async (detailsId, review) => {
    try {
      setLoading(true);
      setError(null);
      
      const bookDetailDoc = await getDoc(doc(db, 'bookDetails', detailsId));
      
      if (!bookDetailDoc.exists()) {
        throw new Error('Book details not found');
      }
      
      const currentReviews = bookDetailDoc.data().reviews || [];
      const newReview = {
        id: Date.now().toString(),
        ...review,
        createdAt: serverTimestamp()
      };
      
      const updatedReviews = [...currentReviews, newReview];
      
      await updateDoc(doc(db, 'bookDetails', detailsId), {
        reviews: updatedReviews,
        updatedAt: serverTimestamp()
      });
      
      // Update in local state
      setBookDetails(prevDetails => 
        prevDetails.map(detail => 
          detail.id === detailsId 
            ? { ...detail, reviews: updatedReviews }
            : detail
        )
      );
      
      return newReview;
    } catch (err) {
      console.error('Error adding review:', err);
      setError('Failed to add review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Real-time listener for book details
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "bookDetails"),
      (snapshot) => {
        const bookDetailsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookDetails(bookDetailsData);
      },
      (error) => {
        console.error('Error listening to book details:', error);
        setError('Failed to listen to book details updates');
      }
    );

    return () => unsubscribe();
  }, []);

  const value = {
    bookDetails,
    loading,
    error,
    fetchBookDetails,
    getBookDetailsByBookId,
    getBookDetailsById,
    createBookDetails,
    updateBookDetails,
    deleteBookDetails,
    addReview
  };

  return (
    <FirebaseBookDetailsContext.Provider value={value}>
      {children}
    </FirebaseBookDetailsContext.Provider>
  );
};


