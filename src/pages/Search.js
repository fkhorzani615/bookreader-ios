import React, { useState, useContext, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Play, BookOpen, Star, Clock, Users, ArrowRight, Search as SearchIcon, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import "./Search.css";
import { BookContext } from '../context/books';
import { useFirebaseVideos } from '../context/FirebaseVideosContext';
import { useAuth } from '../context/AuthContext';

const Search = () => {
  const { currentUser } = useAuth();
  const { books } = useContext(BookContext);
  const { videos } = useFirebaseVideos();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || "");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  // Only use books the user can see
  const visibleBooks = books.filter(book =>
    book.isPublic ||
    (currentUser && book.userId === currentUser.uid) ||
    (currentUser && currentUser.isAdmin)
  );

  // Calculate categories with actual counts from data
  useEffect(() => {
    const calculateCategories = () => {
      const allCategories = new Set();
      
      // Get all unique categories from videos and books
      videos.forEach(video => {
        if (video.category) allCategories.add(video.category);
      });
      visibleBooks.forEach(book => {
        if (book.category) allCategories.add(book.category);
      });

      // Create category objects with actual counts
      const categoriesWithCounts = Array.from(allCategories).map((categoryName, index) => {
        const videoCount = videos.filter(video => video.category === categoryName).length;
        const bookCount = visibleBooks.filter(book => book.category === categoryName).length;
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
  }, [videos, books, currentUser]);

  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    // Update URL with search query
    if (newQuery) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  };

  // Update query when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery !== query) {
      setQuery(urlQuery || "");
    }
  }, [searchParams, query]);

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
      const filteredVids = videos.filter(video => video.category === category.name);
      const filteredBks = visibleBooks.filter(book => book.category === category.name);
      setFilteredVideos(filteredVids);
      setFilteredBooks(filteredBks);
    }
  };

  // Filter by title only
  const filteredBooksByTitle = visibleBooks.filter(
    (book) =>
      (book.title && book.title.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredVideosByTitle = videos.filter((video) =>
    video.title && video.title.toLowerCase().includes(query.toLowerCase())
  );

  // Get display videos and books (filtered by title or category)
  const displayVideos = query ? filteredVideosByTitle : (selectedCategory ? filteredVideos : videos);
  const displayBooks = query ? filteredBooksByTitle : (selectedCategory ? filteredBooks : visibleBooks);

  // Function to handle video thumbnail click
  const handleVideoClick = (video) => {
    // Check if video has a video URL
    if (video.videoUrl) {
      // Open video URL in new tab
      window.open(video.videoUrl, '_blank');
    } else {
      // Navigate to video player page
      window.location.href = `/video/${video.id}`;
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Search Header */}
        <div className="search-header">
          <div className="search-title">
            <h1>Search Results</h1>
            <p>{query ? `Searching for: "${query}"` : 'Browse all content'}</p>
          </div>
          
          <div className="search-input-container">
            <SearchIcon size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title..."
              value={query}
              onChange={handleChange}
              className="search-input"
            />
            {query && (
              <button 
                onClick={() => {
                  setQuery('');
                  setSearchParams({});
                }}
                className="clear-search"
              >
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Section */}
        <section className="categories">
          <div className="section-header">
            <h2>Browse by Category</h2>
            <p>Filter content by category</p>
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
        </section>

        {/* Videos Section */}
        <section className="featured-videos">
          <div className="section-header">
            <h2>{query ? `Videos matching "${query}"` : (selectedCategory ? `${selectedCategory} Videos` : 'All Videos')}</h2>
            {(selectedCategory || query) && (
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  setQuery('');
                  setSearchParams({});
                }}
                className="clear-filter-btn"
              >
                Clear Filters
              </button>
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
                    className="video-thumbnail"
                    onClick={() => handleVideoClick(video)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={video.thumbnail} alt={video.title} />
                    <div className="video-overlay">
                      {video.videoUrl ? (
                        <ExternalLink size={24} />
                      ) : (
                        <Play size={24} />
                      )}
                    </div>
                    <div className="video-duration">{video.duration}</div>
                    {video.videoUrl && (
                      <div className="youtube-badge">
                        <span>Video</span>
                      </div>
                    )}
                  </div>
                  <div className="video-info">
                    <h3>{video.title}</h3>
                    <p>{video.description}</p>
                    <div className="video-meta">
                      <span className="instructor">{video.instructor}</span>
                      <div className="video-stats">
                        <span className="views">
                          <Users size={14} />
                          {video.views}
                        </span>
                        <span className="rating">
                          <Star size={14} />
                          {video.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-content">
                <p>{query ? `No videos found matching "${query}"` : 'No videos available'}</p>
              </div>
            )}
          </div>
        </section>

        {/* Books Section */}
        <section className="featured-books">
          <div className="section-header">
            <h2>{query ? `Books matching "${query}"` : (selectedCategory ? `${selectedCategory} Books` : 'All Books')}</h2>
          </div>
          <div className="books-grid">
            {displayBooks.length > 0 ? (
              displayBooks.map((book) => (
                <Link to={`/book/${book.id}`} key={book.id} style={{ textDecoration: 'none' }}>
                  <motion.div
                    className="book-card"
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="book-cover">
                      <img src={book.cover} alt={book.title} />
                      <div className="book-overlay">
                        <BookOpen size={24} />
                      </div>
                    </div>
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <p className="author">by {book.author}</p>
                      <div className="book-meta">
                        <span className="rating">
                          <Star size={14} />
                          {book.rating}
                        </span>
                        <span className="pages">
                          <Clock size={14} />
                          {book.pages} pages
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="no-content">
                <p>{query ? `No books found matching "${query}"` : 'No books available'}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Search; 