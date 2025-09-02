import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Clock, 
  Star, 
  Calendar, 
  Tag, 
  DollarSign,
  Download,
  Play,
  Volume2
} from 'lucide-react';
import toast from 'react-hot-toast';
import './BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchBook = async () => {
      if (!id) {
        setError('No book ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch book data directly from Firebase
        const bookDoc = await getDoc(doc(db, 'books', id));
        
        if (!isMounted) return;
        
        if (!bookDoc.exists()) {
          setError('Book not found');
          setLoading(false);
          return;
        }
        
        const bookData = { id: bookDoc.id, ...bookDoc.data() };
        setBook(bookData);
        setLoading(false);
        
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching book:', err);
        setError('Failed to load book details');
        setLoading(false);
      }
    };
    
    fetchBook();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDownloadAudio = () => {
    if (book?.audioUrl) {
      const link = document.createElement('a');
      link.href = book.audioUrl;
      link.download = `${book.title}_audiobook`;
      link.click();
      toast.success('Audio download started!');
    } else {
      toast.error('Audio file not available');
    }
  };

  const handlePlayAudio = () => {
    if (book?.audioUrl) {
      const audio = new Audio(book.audioUrl);
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        toast.error('Could not play audio file');
      });
      toast.success('Playing audio...');
    } else {
      toast.error('Audio file not available');
    }
  };

  const getBookCoverImage = () => {
    if (book?.cover) {
      return book.cover;
    } else if (book?.imageUrl) {
      return book.imageUrl;
    }
    return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  };

  if (loading) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <div className="loading-state">
            <BookOpen size={48} className="loading-icon" />
            <p>Loading book details...</p>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-details-page">
        <div className="book-details-container">
          <div className="error-state">
            <BookOpen size={48} className="error-icon" />
            <h2>Book Not Found</h2>
            <p>{error || 'The requested book could not be found.'}</p>
            <button 
              onClick={() => navigate('/books')} 
              className="btn btn-primary"
            >
              Back to Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        {/* Header with back button */}
        <div className="book-details-header">
          <button 
            onClick={() => navigate(-1)} 
            className="back-button"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {/* Book Content */}
        <div className="book-content">
          {/* Book Cover and Basic Info */}
          <div className="book-hero">
            <div className="book-cover">
              <img 
                src={getBookCoverImage()} 
                alt={book.title} 
                className="cover-image"
              />
            </div>
            
            <div className="book-info">
              <h1 className="book-title">{book.title}</h1>
              <p className="book-author">
                <User size={16} />
                {book.author}
              </p>
              
              <div className="book-meta">
                {book.category && (
                  <span className="meta-item">
                    <Tag size={14} />
                    {book.category}
                  </span>
                )}
                {book.pages && (
                  <span className="meta-item">
                    <BookOpen size={14} />
                    {book.pages} pages
                  </span>
                )}
                {book.rating && (
                  <span className="meta-item">
                    <Star size={14} />
                    {book.rating}/5
                  </span>
                )}
                {book.price && (
                  <span className="meta-item">
                    <DollarSign size={14} />
                    ${book.price}
                  </span>
                )}
                {book.createdAt && (
                  <span className="meta-item">
                    <Calendar size={14} />
                    {new Date(book.createdAt?.toDate?.() || book.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Status Badges */}
              <div className="status-badges">
                <span className={`badge ${book.isPublic ? 'public' : 'private'}`}>
                  {book.isPublic ? 'Public' : 'Private'}
                </span>
                {book.featured && (
                  <span className="badge featured">Featured</span>
              )}
            </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="btn btn-primary">
                  <BookOpen size={16} />
                  Read Book
              </button>
              
                {book.audioUrl && (
                  <>
                    <button 
                      onClick={handlePlayAudio}
                      className="btn btn-secondary"
                    >
                      <Play size={16} />
                  Listen
                </button>
                    <button 
                      onClick={handleDownloadAudio}
                      className="btn btn-outline"
                    >
                      <Download size={16} />
                      Download Audio
                    </button>
                  </>
                )}
                
                <button className="btn btn-outline">
                  <Star size={16} />
                  Add to Favorites
                </button>
              </div>
            </div>
          </div>

          {/* Book Description */}
          {book.description && (
            <div className="book-description">
              <h3>Description</h3>
              <p>{book.description}</p>
            </div>
          )}

          {/* Basic Book Information */}
              <div className="book-details-section">
            <h3 className="section-title">Book Information</h3>
                <div className="detail-section">
                  <div className="detail-grid">
                    <div className="detail-item">
                  <strong>Title:</strong> {book.title}
                    </div>
                    <div className="detail-item">
                  <strong>Author:</strong> {book.author}
                    </div>
                    <div className="detail-item">
                  <strong>Category:</strong> {book.category || 'Not specified'}
                    </div>
                    <div className="detail-item">
                  <strong>Pages:</strong> {book.pages || 'Not specified'}
                    </div>
                    <div className="detail-item">
                  <strong>Rating:</strong> {book.rating || 'Not rated'}
                </div>
                {book.price && (
                  <div className="detail-item">
                    <strong>Price:</strong> ${book.price}
                  </div>
                )}
                {book.createdAt && (
                  <div className="detail-item">
                    <strong>Added:</strong> {new Date(book.createdAt?.toDate?.() || book.createdAt).toLocaleDateString()}
                  </div>
                )}
                {book.userName && (
                  <div className="detail-item">
                    <strong>Uploaded by:</strong> {book.userName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
