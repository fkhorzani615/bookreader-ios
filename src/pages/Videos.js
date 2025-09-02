import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Search, Play, Star, Clock, Users, Filter, X, Eye, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import './Videos.css';
import { useLanguage } from '../context/LanguageContext';
import { useFirebaseVideos } from '../context/FirebaseVideosContext';
import StarRating from '../components/StarRating';

const Videos = () => {
    const { t } = useLanguage();
    const { videos, loading } = useFirebaseVideos();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('title');
    const [showFilters, setShowFilters] = useState(false);

    // Get unique categories from videos
    const categories = ['all', ...new Set(videos.map(video => video.category).filter(Boolean))];

    // Filter and sort videos
    const filteredVideos = videos
        .filter(video => {
            const matchesSearch = !searchQuery || 
                (video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (video.instructor && video.instructor.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
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

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSortBy('title');
    };

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

    if (loading) {
        return (
            <div className="videos-page">
                <div className="container">
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p>{t.loading}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!videos.length) {
        return (
            <div className="videos-page">
                <div className="container">
                    <div className="no-videos">
                        <Play size={64} />
                        <h2>{t.noVideosAvailable}</h2>
                        <p>Check back later for new videos!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="videos-page">
            <div className="container">
                {/* Header */}
                <div className="videos-header">
                    <div className="videos-title">
                        <h1>{t.allVideos}</h1>
                        <p>{filteredVideos.length} {t.of} {videos.length} {t.videosCount}</p>
                    </div>
                    
                    {/* Search and Filters */}
                    <div className="videos-controls">
                        <div className="search-container">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder={t.searchVideosPlaceholder}
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
                                    <option value="instructor">{t.instructor}</option>
                                    <option value="rating">{t.rating}</option>
                                    <option value="views">{t.views}</option>
                                    <option value="duration">{t.duration}</option>
                                </select>
                            </div>
                            
                            <button onClick={handleClearFilters} className="clear-filters">
                                {t.clearAllFilters}
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Videos Grid */}
                <div className="videos-grid">
                    {filteredVideos.length > 0 ? (
                        filteredVideos.map((video) => (
                            <motion.div
                                key={video.id}
                                className="video-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ y: -8 }}
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
                                                    value={video.rating || 0}
                                                    readonly={true}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="no-results">
                            <Search size={64} />
                            <h3>{t.noVideosFound}</h3>
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

export default Videos; 