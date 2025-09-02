import React, { useEffect, useState, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

const SQLiteBooksContext = React.createContext();

const SQLiteBooksProvider = ({ children }) => {
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
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      console.log("Order is successful");
    } catch (err) {
      console.log('Error creating order:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      // Fetch all books from MySQL API
      const response = await fetch('http://localhost:3001/api/books?isPublic=true');
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const booksData = await response.json();
      
      // Filter featured books
      const featured = booksData.filter((book) => {
        return !!book.featured;
      });
      
      setBooks(booksData);
      setFeatured(featured);
      setLoading(false);
    } catch (err) {
      console.log('Error fetching books:', err);
      setLoading(false);
    }
  };

  const createBook = async (bookData) => {
    try {
      const response = await fetch('http://localhost:3001/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create book');
      }
      
      const newBook = await response.json();
      setBooks(prev => [newBook, ...prev]);
      return newBook;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  };

  const updateBook = async (bookId, bookData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update book');
      }
      
      const updatedBook = await response.json();
      setBooks(prev => prev.map(book => book.id === bookId ? updatedBook : book));
      return updatedBook;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  const deleteBook = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete book');
      }
      
      setBooks(prev => prev.filter(book => book.id !== bookId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  const getBook = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/books/${bookId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch book');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching book:', error);
      return null;
    }
  };

  const value = { 
    books, 
    featured, 
    loading, 
    checkout, 
    fetchBooks, 
    createBook, 
    updateBook,
    deleteBook,
    getBook 
  };

  return (
    <SQLiteBooksContext.Provider value={value}>
      {children}
    </SQLiteBooksContext.Provider>
  );
};

// Custom hook to use the SQLiteBooks context
const useSQLiteBooks = () => {
  const context = useContext(SQLiteBooksContext);
  if (!context) {
    throw new Error('useSQLiteBooks must be used within a SQLiteBooksProvider');
  }
  return context;
};

export { SQLiteBooksProvider, useSQLiteBooks };
export default SQLiteBooksContext;

