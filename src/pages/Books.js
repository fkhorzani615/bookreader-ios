import React, { useState, useContext, useEffect } from 'react';
import { Link } from "react-router-dom";
import { BookContext } from '../context/books';
import { Search, BookOpen, Star, Clock, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import './Books.css';
import { pdfjs } from 'react-pdf';
import { useMySQLAuth } from '../context/MySQLAuthContext';
import { useLanguage } from '../context/LanguageContext';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Books = () => {
    const { books, loading } = useContext(BookContext);
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('title');
    const [showFilters, setShowFilters] = useState(false);

    // Get unique categories from books
    const categories = ['all', ...new Set(books.map(book => book.category).filter(Boolean))];

    // Filter and sort books
    const filteredBooks = books
        .filter(book => book.isPublic) // Only show public books
        .filter(book => {
            const matchesSearch = !searchQuery || 
                (book.title && book.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
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
        setSelectedCategory('all');
        setSortBy('title');
    };

    if (!books.length) {
        return (
            <div className="books-page">
                <div className="container">
                    <div className="no-books">
                        <BookOpen size={64} />
                        <h2>{t.noBooksAvailable}</h2>
                        <p>Check back later for new books!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="books-page">
            <div className="container">
                {/* Header */}
                <div className="books-header">
                    <div className="books-title">
                        <h1>{t.allBooks}</h1>
                        <p>{filteredBooks.length} {t.of} {books.length} {t.booksCount}</p>
                    </div>
                    
                    {/* Search and Filters */}
                    <div className="books-controls">
                        <div className="search-container">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder={t.searchBooksPlaceholder}
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
                            {t.filters}
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <motion.div 
                            className="filter-panel"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="filter-group">
                                <label>{t.category}:</label>
                                <select 
                                    value={selectedCategory} 
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="filter-select"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category === 'all' ? t.allCategories : category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label>{t.sortBy}:</label>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="title">{t.title}</option>
                                    <option value="author">{t.author}</option>
                                    <option value="rating">{t.rating}</option>
                                    <option value="pages">{t.pages}</option>
                                </select>
                            </div>
                            
                            <button onClick={handleClearFilters} className="clear-filters">
                                {t.clearAllFilters}
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Books Grid */}
                <div className="books-grid">
                    {filteredBooks.length > 0 ? (
                        filteredBooks.map((book) => (
                            <motion.div
                                key={book.id}
                                className="book-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ y: -8 }}
                            >
                                <div className="book-cover">
                                    <img 
                                        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                                        alt={book.title || 'Book cover'} 
                                    />
                                    <div className="book-overlay">
                                        <BookOpen size={24} />
                                    </div>
                                    {book.category && (
                                        <div className="book-category">{book.category}</div>
                                    )}
                                </div>
                                
                                <div className="book-info">
                                    <h3 className="book-title">{book.title || 'Untitled'}</h3>
                                    <p className="book-author">{t.by} {book.author || 'Unknown Author'}</p>
                                    
                                    {book.description && (
                                        <p className="book-description">
                                            {book.description.length > 100 
                                                ? `${book.description.substring(0, 100)}...` 
                                                : book.description
                                            }
                                        </p>
                                    )}
                                    
                                    <div className="book-meta">
                                        {book.rating && (
                                            <span className="book-rating">
                                                <Star size={14} />
                                                {book.rating}
                                            </span>
                                        )}
                                        {book.pages && (
                                            <span className="book-pages">
                                                <Clock size={14} />
                                                {book.pages} {t.pages}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <Link to={`/book/${book.id}`} className="book-link">
                                        {t.readBook}
                                    </Link>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="no-results">
                            <Search size={64} />
                            <h3>{t.noBooksFound}</h3>
                            <p>{t.tryAdjustingSearch}</p>
                            <button onClick={handleClearFilters} className="btn btn-primary">
                                {t.clearFilters}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Books;
