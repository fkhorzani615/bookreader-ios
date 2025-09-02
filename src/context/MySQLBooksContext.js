import React, { createContext, useContext, useState, useEffect } from 'react';

// Configure API base URL for production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://win8126.site4now.net:3001/api' 
  : 'http://localhost:3001/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Helper function for file uploads
const uploadFile = async (endpoint, formData) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: formData
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

const MySQLBooksContext = createContext();

export const useMySQLBooks = () => {
  const context = useContext(MySQLBooksContext);
  if (!context) {
    throw new Error('useMySQLBooks must be used within a MySQLBooksProvider');
  }
  return context;
};

export const MySQLBooksProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });

      const data = await apiCall(`/books?${params.toString()}`);
      setBooks(data);
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch books';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getBook = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall(`/books/${id}`);
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch book';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (bookData) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Add text fields
      Object.keys(bookData).forEach(key => {
        if (key !== 'bookImage' && key !== 'bookAudio') {
          formData.append(key, bookData[key]);
        }
      });
      
      // Add files if they exist
      if (bookData.bookImage) {
        formData.append('bookImage', bookData.bookImage);
      }
      
      if (bookData.bookAudio) {
        formData.append('bookAudio', bookData.bookAudio);
      }

      const data = await uploadFile('/books', formData);
      
      // Add new book to the list
      setBooks(prevBooks => [data, ...prevBooks]);
      
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to create book';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall(`/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(bookData)
      });
      
      // Update book in the list
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === id ? data : book
        )
      );
      
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to update book';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiCall(`/books/${id}`, {
        method: 'DELETE'
      });
      
      // Remove book from the list
      setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
      
      return true;
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete book';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPublicBooks = async () => {
    return fetchBooks({ isPublic: true });
  };

  const getFeaturedBooks = async () => {
    return fetchBooks({ featured: true });
  };

  const getBooksByCategory = async (category) => {
    return fetchBooks({ category, isPublic: true });
  };

  const getUserBooks = async (userId) => {
    return fetchBooks({ userId });
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    books,
    loading,
    error,
    fetchBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    getPublicBooks,
    getFeaturedBooks,
    getBooksByCategory,
    getUserBooks,
    clearError
  };

  return (
    <MySQLBooksContext.Provider value={value}>
      {children}
    </MySQLBooksContext.Provider>
  );
};
