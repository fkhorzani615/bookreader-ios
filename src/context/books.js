import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase/config";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from "firebase/firestore";

const BookContext = React.createContext();

const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const checkout = async (orderDetails) => {
    const payload = {
      id: uuidv4(),
      ...orderDetails,
      createdAt: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, "orders"), payload);
      console.log("Order is successful");
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const booksQuery = query(collection(db, "books"), orderBy('createdAt', 'desc'));
      const booksSnapshot = await getDocs(booksQuery);
      let booksData = booksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no books in Firebase, add sample data
      if (booksData.length === 0) {
        console.log('No books found in Firebase, adding sample data...');
        booksData = [
          {
            id: 'sample-1',
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
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'sample-2',
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
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'sample-3',
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
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'sample-4',
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
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'sample-5',
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
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
      }
      
      const featured = booksData.filter((book) => {
        return !!book.featured;
      });
      
      setBooks(booksData);
      setFeatured(featured);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const getBook = async (id) => {
    try {
      setLoading(true);
      const bookDoc = await getDoc(doc(db, 'books', id));
      if (!bookDoc.exists()) {
        throw new Error('Book not found');
      }
      
      return {
        id: bookDoc.id,
        ...bookDoc.data()
      };
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (bookData, userId) => {
    try {
      setLoading(true);
      
      const bookDoc = {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        category: bookData.category,
        price: bookData.price || 0,
        imageUrl: bookData.imageUrl || '',
        pdfUrl: bookData.pdfUrl || '',
        isPublic: bookData.isPublic !== undefined ? bookData.isPublic : true,
        featured: bookData.featured || false,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rating: 0,
        reviews: [],
        tags: bookData.tags || []
      };
      
      const docRef = await addDoc(collection(db, 'books'), bookDoc);
      const newBook = {
        id: docRef.id,
        ...bookDoc
      };
      
      // Add new book to the list
      setBooks(prevBooks => [newBook, ...prevBooks]);
      
      return newBook;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      setLoading(true);
      
      const updateData = {
        ...bookData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'books', id), updateData);
      
      // Update book in the list
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === id ? { ...book, ...updateData } : book
        )
      );
      
      return { id, ...updateData };
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    try {
      setLoading(true);
      
      await deleteDoc(doc(db, 'books', id));
      
      // Remove book from the list
      setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
      
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookContext.Provider value={{ 
      books, 
      featured, 
      loading, 
      checkout, 
      getBook, 
      createBook, 
      updateBook, 
      deleteBook,
      fetchBooks 
    }}>
      {children}
    </BookContext.Provider>
  );
};

export { BookContext, BookProvider };
