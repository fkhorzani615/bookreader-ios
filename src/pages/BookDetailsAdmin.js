import React, { useState, useEffect, useContext } from 'react';
import { BookContext } from '../context/books';
import { useFirebaseBookDetails } from '../context/FirebaseBookDetailsContext';
import { populateBookDetails, getBookDetailsStats } from '../utils/populateBookDetails';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Database, 
  Plus, 
  RefreshCw, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Loader
} from 'lucide-react';
import './BookDetailsAdmin.css';

const BookDetailsAdmin = () => {
  const { books, loading: booksLoading } = useContext(BookContext);
  const { bookDetails, loading: detailsLoading, fetchBookDetails } = useFirebaseBookDetails();
  const { currentUser } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [populating, setPopulating] = useState(false);
  const [populateResult, setPopulateResult] = useState(null);

  useEffect(() => {
    loadStats();
  }, [books, bookDetails]);

  const loadStats = async () => {
    try {
      const statsData = await getBookDetailsStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handlePopulateBookDetails = async () => {
    try {
      setPopulating(true);
      setPopulateResult(null);
      
      const result = await populateBookDetails();
      setPopulateResult(result);
      
      // Refresh the book details
      await fetchBookDetails();
      await loadStats();
      
    } catch (error) {
      console.error('Error populating book details:', error);
      setPopulateResult({ error: error.message });
    } finally {
      setPopulating(false);
    }
  };

  const getBooksWithoutDetails = () => {
    const bookIdsWithDetails = bookDetails.map(detail => detail.bookId);
    return books.filter(book => !bookIdsWithDetails.includes(book.id));
  };

  if (!currentUser) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="access-denied">
            <AlertCircle size={48} />
            <h2>Access Denied</h2>
            <p>You must be logged in to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Book Details Management</h1>
          <p>Manage and populate book details in Firebase</p>
        </div>

        {/* Statistics Section */}
        <div className="stats-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats?.totalBooks || 0}</div>
                <div className="stat-label">Total Books</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Database size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats?.totalBookDetails || 0}</div>
                <div className="stat-label">Book Details</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <BarChart3 size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats?.coverage || 0}%</div>
                <div className="stat-label">Coverage</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <AlertCircle size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats?.missingDetails || 0}</div>
                <div className="stat-label">Missing Details</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="actions-section">
          <h2>Actions</h2>
          
          <div className="action-card">
            <div className="action-header">
              <h3>Populate Book Details</h3>
              <p>Create sample book details for all books that don't have them</p>
            </div>
            
            <div className="action-content">
              <button 
                onClick={handlePopulateBookDetails}
                disabled={populating || booksLoading}
                className="populate-button"
              >
                {populating ? (
                  <>
                    <Loader size={20} className="spinning" />
                    Populating...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Populate Book Details
                  </>
                )}
              </button>
              
              {populateResult && (
                <div className={`populate-result ${populateResult.error ? 'error' : 'success'}`}>
                  {populateResult.error ? (
                    <>
                      <AlertCircle size={20} />
                      <span>Error: {populateResult.error}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>
                        Successfully created {populateResult.created} book details. 
                        Skipped {populateResult.skipped} existing entries.
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="action-card">
            <div className="action-header">
              <h3>Refresh Data</h3>
              <p>Refresh the current data from Firebase</p>
            </div>
            
            <div className="action-content">
              <button 
                onClick={() => {
                  fetchBookDetails();
                  loadStats();
                }}
                disabled={detailsLoading}
                className="refresh-button"
              >
                <RefreshCw size={20} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Books Without Details */}
        <div className="books-section">
          <h2>Books Without Details</h2>
          {booksLoading ? (
            <div className="loading-state">
              <Loader size={32} className="spinning" />
              <p>Loading books...</p>
            </div>
          ) : (
            <div className="books-list">
              {getBooksWithoutDetails().length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={48} />
                  <p>All books have details!</p>
                </div>
              ) : (
                getBooksWithoutDetails().map(book => (
                  <div key={book.id} className="book-item">
                    <div className="book-info">
                      <h4>{book.title}</h4>
                      <p>by {book.author}</p>
                      <span className="book-category">{book.category}</span>
                    </div>
                    <div className="book-actions">
                      <span className="missing-badge">Missing Details</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Book Details List */}
        <div className="details-section">
          <h2>Existing Book Details</h2>
          {detailsLoading ? (
            <div className="loading-state">
              <Loader size={32} className="spinning" />
              <p>Loading book details...</p>
            </div>
          ) : (
            <div className="details-list">
              {bookDetails.length === 0 ? (
                <div className="empty-state">
                  <Database size={48} />
                  <p>No book details found</p>
                </div>
              ) : (
                bookDetails.map(detail => {
                  const book = books.find(b => b.id === detail.bookId);
                  return (
                    <div key={detail.id} className="detail-item">
                      <div className="detail-info">
                        <h4>{book?.title || 'Unknown Book'}</h4>
                        <p>by {book?.author || 'Unknown Author'}</p>
                        <div className="detail-meta">
                          <span>ISBN: {detail.isbn || 'Not specified'}</span>
                          <span>Pages: {detail.pageCount}</span>
                          <span>Reviews: {detail.reviews?.length || 0}</span>
                        </div>
                      </div>
                      <div className="detail-actions">
                        <span className="exists-badge">Details Exist</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailsAdmin;


