import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download,
  BookOpen,
  Clock,
  Star,
  Users,
  Share2,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import './BookReader.css';

// Remove all PDF.js and react-pdf related code from this file.

const BookReader = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock book data - in real app, fetch from Firebase
    setBook({
      id: id,
      title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
      author: 'James Clear',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pages: 320,
      rating: 4.9,
      views: '45K',
      category: 'Self-Help',
      description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
      tags: ['self-help', 'productivity', 'habits', 'personal-development'],
      uploadedAt: '2024-01-10',
      likes: 892,
      readingTime: '6 hours'
    });
    setLoading(false);
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const changeScale = (delta) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.min(Math.max(0.5, newScale), 2.0);
    });
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading book...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="error-container">
        <h2>Book not found</h2>
        <p>The book you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="book-reader-page">
      <div className="book-header">
        <div className="book-info">
          <div className="book-cover">
            <img src={book.cover} alt={book.title} />
          </div>
          <div className="book-details">
            <h1>{book.title}</h1>
            <p className="author">by {book.author}</p>
            <div className="book-stats">
              <span className="rating">
                <Star size={16} />
                {book.rating}
              </span>
              <span className="views">
                <Users size={16} />
                {book.views} reads
              </span>
              <span className="reading-time">
                <Clock size={16} />
                {book.readingTime}
              </span>
            </div>
            <div className="book-actions">
              <button 
                className={`action-btn ${isLiked ? 'liked' : ''}`}
                onClick={toggleLike}
              >
                <Heart size={18} />
                <span>{isLiked ? book.likes + 1 : book.likes}</span>
              </button>
              <button className="action-btn">
                <Share2 size={18} />
                <span>Share</span>
              </button>
              <button className="action-btn">
                <Download size={18} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="reader-container">
        <div className="reader-controls">
          <div className="page-controls">
            <button 
              className="control-btn"
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="page-info">
              Page {pageNumber} of {numPages || '...'}
            </span>
            <button 
              className="control-btn"
              onClick={() => changePage(1)}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="zoom-controls">
            <button 
              className="control-btn"
              onClick={() => changeScale(-0.1)}
              disabled={scale <= 0.5}
            >
              <ZoomOut size={20} />
            </button>
            <span className="zoom-level">{Math.round(scale * 100)}%</span>
            <button 
              className="control-btn"
              onClick={() => changeScale(0.1)}
              disabled={scale >= 2.0}
            >
              <ZoomIn size={20} />
            </button>
          </div>
        </div>

        <div className="pdf-container">
          <motion.div 
            className="pdf-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* The PDF viewer content has been removed as per the edit hint. */}
            <p>PDF viewer content removed as per edit hint.</p>
          </motion.div>
        </div>
      </div>

      <div className="book-description">
        <h3>About this book</h3>
        <p>{book.description}</p>
        <div className="book-tags">
          {book.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookReader; 