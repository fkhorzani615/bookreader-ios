import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, Phone, MapPin, Camera, Edit, Save, X, Play, BookOpen, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BookContext } from '../context/books';
import { useFirebaseVideos } from '../context/FirebaseVideosContext';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
      const { books, updateBook, deleteBook } = useContext(BookContext);
    const { videos, updateVideo, deleteVideo } = useFirebaseVideos();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
    status: 'online'
  });

  const [tempData, setTempData] = useState({ ...userData });
  const [userVideos, setUserVideos] = useState([]);
  const [userBooks, setUserBooks] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingBookData, setEditingBookData] = useState({});
  const [editingVideoData, setEditingVideoData] = useState({});

  // Initialize user data when currentUser is available
  useEffect(() => {
    if (currentUser) {
      const profileData = {
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        bio: currentUser.bio || '',
        avatar: currentUser.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : (currentUser.email ? currentUser.email.substring(0, 2).toUpperCase() : 'U'),
        status: 'online'
      };
      setUserData(profileData);
      setTempData(profileData);
    }
  }, [currentUser]);

  // Fetch user's uploaded content
  useEffect(() => {
    if (!currentUser) return;

    try {
      setLoadingContent(true);
      
      // Filter user's videos and books from SQLite data
      const userVideosList = videos.filter(video => video.userId === currentUser.uid);
      const userBooksList = books.filter(book => book.userId === currentUser.uid);
      
      setUserVideos(userVideosList);
      setUserBooks(userBooksList);
    } catch (error) {
      console.error('Error fetching user content:', error);
      toast.error('Failed to load your content');
    } finally {
      setLoadingContent(false);
    }
  }, [currentUser, videos, books]);

  const handleEdit = () => {
    setTempData({ ...userData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updates = {
        displayName: tempData.displayName,
        phone: tempData.phone,
        location: tempData.location,
        bio: tempData.bio
      };

      await updateProfile(updates);
      setUserData({ ...tempData });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setTempData({ ...userData });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setTempData({
      ...tempData,
      [e.target.name]: e.target.value
    });
  };

  // Book editing methods
  const handleEditBook = (book) => {
    setEditingBook(book.id);
    setEditingBookData({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      pages: book.pages,
      price: book.price,
      isPublic: book.isPublic,
      featured: book.featured
    });
  };

  const handleSaveBook = async (bookId) => {
    try {
      const updatedBook = await updateBook(bookId, editingBookData);
      setUserBooks(prev => prev.map(book => book.id === bookId ? updatedBook : book));
      setEditingBook(null);
      setEditingBookData({});
      toast.success('Book updated successfully!');
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    }
  };

  const handleCancelBookEdit = () => {
    setEditingBook(null);
    setEditingBookData({});
  };

  const handleBookDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingBookData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Video editing methods
  const handleEditVideo = (video) => {
    setEditingVideo(video.id);
    setEditingVideoData({
      title: video.title,
      instructor: video.instructor,
      description: video.description,
      category: video.category,
      duration: video.duration,
      isPublic: video.isPublic,
      featured: video.featured
    });
  };

  const handleSaveVideo = async (videoId) => {
    try {
      const updatedVideo = await updateVideo(videoId, editingVideoData);
      setUserVideos(prev => prev.map(video => video.id === videoId ? updatedVideo : video));
      setEditingVideo(null);
      setEditingVideoData({});
      toast.success('Video updated successfully!');
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video');
    }
  };

  const handleCancelVideoEdit = () => {
    setEditingVideo(null);
    setEditingVideoData({});
  };

  const handleVideoDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingVideoData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteVideo(videoId);
        setUserVideos(prev => prev.filter(video => video.id !== videoId));
        toast.success('Video deleted successfully!');
      } catch (error) {
        console.error('Error deleting video:', error);
        toast.error('Failed to delete video');
      }
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook(bookId);
        setUserBooks(prev => prev.filter(book => book.id !== bookId));
        toast.success('Book deleted successfully!');
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('Failed to delete book');
      }
    }
  };

  // Show loading state if currentUser is not yet loaded
  if (!currentUser) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1>{t.profile}</h1>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  // Show message if not logged in
  if (!currentUser) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1>{t.profile}</h1>
          <p>{t.pleaseLogin}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{t.profile}</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <span>{userData.avatar}</span>
              <div className={`status-indicator ${userData.status}`}></div>
              <button className="avatar-edit-btn">
                <Camera size={16} />
              </button>
            </div>
            <div className="profile-info">
              <h2>{userData.displayName || 'User'}</h2>
              <span className="status-text">{userData.status}</span>
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button onClick={handleEdit} className="edit-btn">
                <Edit size={16} />
                {t.edit} {t.profile}
              </button>
            ) : (
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn">
                  <Save size={16} />
                  {t.save}
                </button>
                <button onClick={handleCancel} className="cancel-btn">
                  <X size={16} />
                  {t.cancel}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="detail-section">
            <h3>{t.personalInformation}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <User size={20} />
                </div>
                <div className="detail-content">
                  <label>{t.displayName}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="displayName"
                      value={tempData.displayName}
                      onChange={handleChange}
                      className="edit-input"
                    />
                  ) : (
                    <span>{userData.displayName || 'Not set'}</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Mail size={20} />
                </div>
                <div className="detail-content">
                  <label>{t.email}</label>
                  <span>{userData.email}</span>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Phone size={20} />
                </div>
                <div className="detail-content">
                  <label>{t.phone}</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={tempData.phone}
                      onChange={handleChange}
                      className="edit-input"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <span>{userData.phone || 'Not set'}</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <MapPin size={20} />
                </div>
                <div className="detail-content">
                  <label>{t.location}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={tempData.location}
                      onChange={handleChange}
                      className="edit-input"
                      placeholder="Enter your location"
                    />
                  ) : (
                    <span>{userData.location || 'Not set'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Content */}
        <div className="user-content-section">
          <h3>My Content</h3>
          
          {/* Videos Section */}
          <div className="content-section">
            <h4>
              <Play size={20} />
              {t.myVideos} ({userVideos.length})
            </h4>
            {loadingContent ? (
              <p>{t.loading}</p>
            ) : userVideos.length > 0 ? (
              <div className="content-grid">
                {userVideos.map((video) => (
                  <div key={video.id} className="content-card">
                    <div className="content-thumbnail">
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
                      <div className="content-overlay">
                        <button 
                          onClick={() => handleEditVideo(video)}
                          className="edit-btn"
                          title="Edit video"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteVideo(video.id)}
                          className="delete-btn"
                          title="Delete video"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="content-info">
                      <h5>{video.title}</h5>
                      <p>{video.description?.substring(0, 60)}...</p>
                      <div className="content-meta">
                        <span className="views">
                          <Eye size={14} />
                          {video.views || 0} {t.views}
                        </span>
                        <span className="status">
                          {video.isPublic ? t.public : t.private}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No videos uploaded yet.</p>
            )}
          </div>

          {/* Books Section */}
          <div className="content-section">
            <h4>
              <BookOpen size={20} />
              {t.myBooks} ({userBooks.length})
            </h4>
            {loadingContent ? (
              <p>{t.loading}</p>
            ) : userBooks.length > 0 ? (
              <div className="content-grid">
                {userBooks.map((book) => (
                  <div key={book.id} className="content-card">
                    <div className="content-thumbnail">
                      <img 
                        src={book.cover || book.image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300'} 
                        alt={book.title}
                      />
                      <div className="content-overlay">
                        <button 
                          onClick={() => handleEditBook(book)}
                          className="edit-btn"
                          title="Edit book"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBook(book.id)}
                          className="delete-btn"
                          title="Delete book"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="content-info">
                      <h5>{book.title}</h5>
                      <p>{book.description?.substring(0, 60)}...</p>
                      <div className="content-meta">
                        <span className="author">{t.by} {book.author || 'Unknown'}</span>
                        <span className="status">
                          {book.isPublic ? t.public : t.private}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No books uploaded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Book Edit Modal */}
      {editingBook && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Book</h3>
              <button onClick={handleCancelBookEdit} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={editingBookData.title || ''}
                  onChange={handleBookDataChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  name="author"
                  value={editingBookData.author || ''}
                  onChange={handleBookDataChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editingBookData.description || ''}
                  onChange={handleBookDataChange}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editingBookData.category || ''}
                    onChange={handleBookDataChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Pages</label>
                  <input
                    type="number"
                    name="pages"
                    value={editingBookData.pages || ''}
                    onChange={handleBookDataChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={editingBookData.price || ''}
                    onChange={handleBookDataChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={editingBookData.isPublic || false}
                    onChange={handleBookDataChange}
                  />
                  Public
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={editingBookData.featured || false}
                    onChange={handleBookDataChange}
                  />
                  Featured
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCancelBookEdit} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleSaveBook(editingBook)} className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Edit Modal */}
      {editingVideo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Video</h3>
              <button onClick={handleCancelVideoEdit} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={editingVideoData.title || ''}
                  onChange={handleVideoDataChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Instructor</label>
                <input
                  type="text"
                  name="instructor"
                  value={editingVideoData.instructor || ''}
                  onChange={handleVideoDataChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editingVideoData.description || ''}
                  onChange={handleVideoDataChange}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editingVideoData.category || ''}
                    onChange={handleVideoDataChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={editingVideoData.duration || ''}
                    onChange={handleVideoDataChange}
                    className="form-input"
                    placeholder="e.g., 15:30"
                  />
                </div>
              </div>
              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={editingVideoData.isPublic || false}
                    onChange={handleVideoDataChange}
                  />
                  Public
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={editingVideoData.featured || false}
                    onChange={handleVideoDataChange}
                  />
                  Featured
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCancelVideoEdit} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleSaveVideo(editingVideo)} className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 