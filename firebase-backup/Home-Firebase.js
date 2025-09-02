import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, Star, Clock, Users, ArrowRight, Search, Filter, X, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import './Home.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import StarRating from '../components/StarRating';
import { BookContext } from '../context/books';



const Home = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { books } = useContext(BookContext);
  // const { videos } = useContext(VideoContext); // If you have videos context

  // Only show public books and videos
  const publicBooks = books.filter(book => book.isPublic);
  const publicVideos = books.filter(book => book.isPublic); // This line was changed to use 'books' directly

  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  // Add local state for user ratings
  const [videoRatings, setVideoRatings] = useState({});
  const [bookRatings, setBookRatings] = useState({});

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksCollection = collection(db, 'books');
        const booksSnapshot = await getDocs(booksCollection);
        const booksList = booksSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(book => book.isPublic === true);
        console.log('Filtered books:', booksList);
        setFeaturedBooks(booksList);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videosCollection = collection(db, 'videos');
        const videosSnapshot = await getDocs(videosCollection);
        const videosList = videosSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(video => video.isPublic === true);
        console.log('Filtered videos:', videosList);
        setFeaturedVideos(videosList);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
    fetchVideos();
  }, []);

  // Calculate categories with actual counts from data
  useEffect(() => {
    const calculateCategories = () => {
      const allCategories = new Set();
      
      // Get all unique categories from videos and books
      featuredVideos.forEach(video => {
        if (video.category) allCategories.add(video.category);
      });
      featuredBooks.forEach(book => {
        if (book.category) allCategories.add(book.category);
      });

      // Create category objects with actual counts
      const categoriesWithCounts = Array.from(allCategories).map((categoryName, index) => {
        const videoCount = featuredVideos.filter(video => video.category === categoryName).length;
        const bookCount = featuredBooks.filter(book => book.category === categoryName).length;
        const totalCount = videoCount + bookCount;

        // Map category names to icons
        const iconMap = {
          'Programming': '💻',
          'Data Science': '📊',
          'Design': '🎨',
          'Business': '💼',
          'Marketing': '📈',
          'Personal Development': '🚀',
          'Technology': '⚡',
          'Science': '🔬',
          'Health': '🏥',
          'Education': '📚',
          'Finance': '💰',
          'Art': '🎭',
          'Music': '🎵',
          'Sports': '⚽',
          'Cooking': '👨‍🍳',
          'Travel': '✈️',
          'Fiction': '📖',
          'Non-Fiction': '📝',
          'Biography': '👤',
          'History': '🏛️'
        };

        return {
          id: (index + 1).toString(),
          name: categoryName,
          icon: iconMap[categoryName] || '📁',
          videoCount,
          bookCount,
          totalCount
        };
      });

      // Sort by total count (descending) and take top 8
      const sortedCategories = categoriesWithCounts
        .sort((a, b) => b.totalCount - a.totalCount)
        .slice(0, 8);

      setCategories(sortedCategories);
    };

    calculateCategories();
  }, [featuredVideos, featuredBooks]);

  // Function to handle category selection
  const handleCategoryClick = (category) => {
    if (selectedCategory === category.name) {
      // If same category is clicked again, clear selection
      setSelectedCategory(null);
      setFilteredVideos([]);
      setFilteredBooks([]);
    } else {
      // Filter videos and books by selected category
      setSelectedCategory(category.name);
      const filteredVids = featuredVideos.filter(video => video.category === category.name);
      const filteredBks = featuredBooks.filter(book => book.category === category.name);
      setFilteredVideos(filteredVids);
      setFilteredBooks(filteredBks);
    }
  };

  // Function to handle video thumbnail click
  const handleVideoClick = async (video) => {
    // Increment views in Firestore
    try {
      const videoRef = doc(db, 'videos', video.id);
      await updateDoc(videoRef, { views: increment(1) });
    } catch (error) {
      console.error('Error incrementing video views:', error);
    }
    // Update local state for immediate UI feedback
    // setFeaturedVideos(prev => // This line is removed as per the new_code
    //   prev.map(v => v.id === video.id ? { ...v, views: (v.views || 0) + 1 } : v)
    // );
    // Existing navigation logic
    if (video.videoUrl) {
      window.open(video.videoUrl, '_blank');
    } else if (video.url) {
      setSelectedVideo(video);
      setShowVideoModal(true);
    } else {
      window.location.href = `/video/${video.id}`;
    }
  };

  // Book click handler to increment views
  const handleBookClick = async (book) => {
    try {
      const bookRef = doc(db, 'books', book.id);
      await updateDoc(bookRef, { views: increment(1) });
    } catch (error) {
      console.error('Error incrementing book views:', error);
    }
    // setFeaturedBooks(prev => // This line is removed as per the new_code
    //   prev.map(b => b.id === book.id ? { ...b, views: (b.views || 0) + 1 } : b)
    // );
  };

  // Function to close video modal
  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  // Helper to calculate new average (for demo, just use the new value)
  const handleVideoRate = (id, rating) => {
    setVideoRatings(prev => ({ ...prev, [id]: rating }));
    // setFeaturedVideos(prev => // This line is removed as per the new_code
    //   prev.map(v => v.id === id ? { ...v, rating } : v)
    // );
  };
  const handleBookRate = (id, rating) => {
    setBookRatings(prev => ({ ...prev, [id]: rating }));
    // setFeaturedBooks(prev => // This line is removed as per the new_code
    //   prev.map(b => b.id === id ? { ...b, rating } : b)
    // );
  };

  // Get display videos and books (filtered by search, category, or all)
  const displayVideos = featuredVideos.filter(video => {
    const matchesSearch = !searchQuery || 
      (video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (video.instructor && video.instructor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'instructor':
        return (a.instructor || '').localeCompare(b.instructor || '');
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'views':
        return (b.views || 0) - (a.views || 0);
      case 'duration':
        return (a.duration || '').localeCompare(b.duration || '');
      default:
        return 0;
    }
  });

  const displayBooks = featuredBooks.filter(book => {
    const matchesSearch = !searchQuery || 
      (book.title && book.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'author':
        return (a.author || '').localeCompare(b.author || '');
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'pages':
        return (b.pages || 0) - (a.pages || 0);
      default:
        return 0;
    }
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSortBy('title');
    setFilteredVideos([]);
    setFilteredBooks([]);
  };

  return (
    <div className="home">
      {/* Search and Filters Section */}
      <section className="home-search-section">
        <div className="container">
          <div className="home-search-header">
            <div className="home-search-title">
              <h1>{t.discoverAmazingContent}</h1>
              <p>{t.searchAndFilterDescription}</p>
            </div>
            
            {/* Search and Filters */}
            <div className="home-search-controls">
              <div className="search-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="clear-search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <button 
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} />
                Filters
              </button>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || selectedCategory || sortBy !== 'title') && (
              <div className="active-filters">
                <div className="active-filters-label">Active Filters:</div>
                <div className="active-filters-tags">
                  {searchQuery && (
                    <span className="filter-tag">
                      Search: "{searchQuery}"
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="remove-filter"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="filter-tag">
                      Category: {selectedCategory}
                      <button 
                        onClick={() => setSelectedCategory(null)}
                        className="remove-filter"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {sortBy !== 'title' && (
                    <span className="filter-tag">
                      Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                      <button 
                        onClick={() => setSortBy('title')}
                        className="remove-filter"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Filter Panel */}
            {showFilters && (
              <motion.div 
                className="filter-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="filter-group">
                  <label>Category:</label>
                  <select 
                    value={selectedCategory || 'all'} 
                    onChange={(e) => setSelectedCategory(e.target.value === 'all' ? null : e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Sort by:</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="title">Title</option>
                    <option value="rating">Rating</option>
                    <option value="views">Views (Videos)</option>
                    <option value="pages">Pages (Books)</option>
                    <option value="instructor">Instructor (Videos)</option>
                    <option value="author">Author (Books)</option>
                    <option value="duration">Duration (Videos)</option>
                  </select>
                </div>
                
                <button onClick={handleClearFilters} className="clear-filters">
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <div className="section-header">
            <h2>Popular Categories</h2>
            <p>Discover content in your favorite topics</p>
          </div>
          <div className="categories-grid">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                className={`category-card ${selectedCategory === category.name ? 'selected' : ''}`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleCategoryClick(category)}
                style={{ cursor: 'pointer' }}
              >
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <div className="category-counts">
                  <span className="video-count">{category.videoCount} videos</span>
                  <span className="book-count">{category.bookCount} books</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Videos Section */}
      <section className="featured-videos">
        <div className="container">
          <div className="section-header">
            <h2>
              {searchQuery 
                ? `${t.videos} matching "${searchQuery}"` 
                : selectedCategory 
                  ? `${selectedCategory} ${t.videos}` 
                  : t.featuredVideos
              }
            </h2>
            {(selectedCategory || searchQuery) && (
              <button 
                onClick={handleClearFilters}
                className="clear-filter-btn"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#007bff', 
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Clear Filters
              </button>
            )}
            {!selectedCategory && !searchQuery && (
              <Link to="/search" className="view-all-link">
                {t.viewAll}
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
          <div className="videos-grid">
            {displayVideos.length > 0 ? (
              displayVideos.map((video) => (
                <motion.div
                  key={video.id}
                  className="video-card"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className="thumbnail"
                    onClick={() => handleVideoClick(video)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div 
                      className="video-thumbnail-placeholder"
                      style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        backgroundColor: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      ▶
                    </div>
                    <div 
                      className="video-title-overlay"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#ffffff',
                        textAlign: 'center',
                        zIndex: '2',
                        maxWidth: '90%',
                        wordWrap: 'break-word',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        padding: '8px 12px',
                        borderRadius: '6px'
                      }}
                    >
                      {video.title}
                    </div>
                    <div className="video-duration">{video.duration}</div>
                    {video.videoUrl && (
                      <div>
                      </div>
                    )}
                  </div>
                  <div className="video-info">
                    <p>{video.description}</p>
                    <div className="video-meta">
                      <span className="instructor">{video.instructor}</span>
                      <div className="video-stats">
                        <span className="views">
                          <Users size={14} />
                          {video.views}
                        </span>
                        <span className="rating">
                          <StarRating
                            value={videoRatings[video.id] || video.rating || 0}
                            readonly={true}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-content">
                <p>{t.noVideosAvailable}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="featured-books">
        <div className="container">
          <div className="section-header">
            <h2>
              {searchQuery 
                ? `${t.books} matching "${searchQuery}"` 
                : selectedCategory 
                  ? `${selectedCategory} ${t.books}` 
                  : t.featuredBooks
              }
            </h2>
            {!selectedCategory && !searchQuery && (
              <Link to="/search" className="view-all-link">
                {t.viewAll}
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
          <div className="books-grid">
            {displayBooks.length > 0 ? (
              displayBooks.map((book) => (
              <Link to={`/book/${book.id}`} key={book.id} style={{ textDecoration: 'none' }} onClick={() => handleBookClick(book)}>
              <motion.div
                className="book-card"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="book-cover">
                    <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt={book.title || 'Book cover'} />
                  <div className="book-overlay">
                    <BookOpen size={24} />
                  </div>
                    <h3 className="book-title-overlay">{book.title}</h3>
                </div>
                <div className="book-info">
                  <p className="author">{t.by} {book.author}</p>
                  <div className="book-meta">
                    <span className="rating">
                        <StarRating
                          value={bookRatings[book.id] || book.rating || 0}
                          readonly={true}
                        />
                    </span>
                    <span className="pages">
                      <Clock size={14} />
                      {book.pages} {t.pages}
                    </span>
                  </div>
                </div>
              </motion.div>
              </Link>
            ))
          ) : (
            <div className="no-content">
              <p>{t.noBooksAvailable}</p>
            </div>
          )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>{t.readyToStartLearning}</h2>
            <p>{t.joinMillionsDescription}</p>
            <Link to="/register" className="btn btn-primary btn-large">
              {t.getStartedNow}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeVideoModal}>
              <X size={24} />
            </button>
            <div className="video-modal-content">
              <h3>{selectedVideo.title}</h3>
              <div className="video-player-container">
                <video
                  controls
                  width="100%"
                  height="auto"
                  src={selectedVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="video-modal-info">
                <p>{selectedVideo.description}</p>
                <div className="video-modal-meta">
                  <span>Instructor: {selectedVideo.instructor}</span>
                  <span>Duration: {selectedVideo.duration}</span>
                  <span>Views: {selectedVideo.views}</span>
                  <span>Rating: {selectedVideo.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;