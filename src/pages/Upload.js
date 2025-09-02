import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BookContext } from '../context/books';
import { useFirebaseVideos } from '../context/FirebaseVideosContext';
import { db, storage } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  BookOpen, 
  Play, 
  Upload, 
  Save, 
  X, 
  Plus, 
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Upload.css';

const UploadPage = () => {
  const { currentUser } = useAuth();
  const { createBook } = useContext(BookContext);
  const { createVideo } = useFirebaseVideos();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('book');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Book form state
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    cover: '',
    pages: '',
    rating: '',
    price: '',
    isPublic: true,
    featured: false,
    teamId: currentUser?.teamId || ''
  });

  // File state for book uploads
  const [bookFiles, setBookFiles] = useState({
    image: null,
    audio: null
  });

  // File state for video uploads
  const [videoFiles, setVideoFiles] = useState({
    video: null
  });

  // Video form state
  const [videoData, setVideoData] = useState({
    title: '',
    instructor: '',
    description: '',
    category: '',
    thumbnail: '',
    videoUrl: '',
    duration: '',
    rating: '',
    views: '',
    isPublic: true,
    featured: false,
    teamId: currentUser?.teamId || ''
  });

  // Custom fields for books
  const [bookCustomFields, setBookCustomFields] = useState([]);
  const [videoCustomFields, setVideoCustomFields] = useState([]);

  const handleBookChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBookFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setBookFiles(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleVideoFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setVideoFiles(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleVideoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVideoData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addBookCustomField = () => {
    setBookCustomFields(prev => [...prev, { key: '', value: '' }]);
  };

  const removeBookCustomField = (index) => {
    setBookCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateBookCustomField = (index, field, value) => {
    setBookCustomFields(prev => 
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  const addVideoCustomField = () => {
    setVideoCustomFields(prev => [...prev, { key: '', value: '' }]);
  };

  const removeVideoCustomField = (index) => {
    setVideoCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateVideoCustomField = (index, field, value) => {
    setVideoCustomFields(prev => 
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('You must be logged in to upload content');
      return;
    }

    if (!bookData.title || !bookData.author) {
      toast.error('Title and author are required');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = bookData.cover;
      let audioUrl = '';

      // Upload image file to Firebase Storage if provided
      if (bookFiles.image) {
        const imageRef = ref(storage, `books/images/${Date.now()}_${bookFiles.image.name}`);
        const imageSnapshot = await uploadBytes(imageRef, bookFiles.image);
        imageUrl = await getDownloadURL(imageSnapshot.ref);
      }

      // Upload audio file to Firebase Storage if provided
      if (bookFiles.audio) {
        const audioRef = ref(storage, `books/audio/${Date.now()}_${bookFiles.audio.name}`);
        const audioSnapshot = await uploadBytes(audioRef, bookFiles.audio);
        audioUrl = await getDownloadURL(audioSnapshot.ref);
      }

      // Process custom fields
      const customFields = {};
      bookCustomFields.forEach(field => {
        if (field.key && field.value) {
          customFields[field.key] = field.value;
        }
      });

      // Prepare book data for Firebase
      const bookDataToSave = {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description || '',
        category: bookData.category || '',
        cover: imageUrl,
        audioUrl: audioUrl,
        pages: bookData.pages ? parseInt(bookData.pages) : null,
        rating: bookData.rating ? parseFloat(bookData.rating) : 0,
        price: bookData.price ? parseFloat(bookData.price) : 0,
        isPublic: bookData.isPublic,
        featured: bookData.featured,
        customFields: customFields,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        teamId: currentUser?.teamId || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save to Firebase Firestore
      await addDoc(collection(db, 'books'), bookDataToSave);
      
      toast.success('Book uploaded successfully!');
      setSuccess(true);
      
      // Reset form
      setBookData({
        title: '',
        author: '',
        description: '',
        category: '',
        cover: '',
        pages: '',
        rating: '',
        price: '',
        isPublic: true,
        featured: false,
        teamId: currentUser?.teamId || ''
      });
      setBookFiles({ image: null, audio: null });
      setBookCustomFields([]);
      
      setTimeout(() => {
        setSuccess(false);
        navigate('/books');
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading book:', error);
      toast.error('Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('You must be logged in to upload content');
      return;
    }

    if (!videoData.title || !videoData.instructor) {
      toast.error('Title and instructor are required');
      return;
    }

    setLoading(true);
    try {
      let videoUrl = videoData.videoUrl;
      let thumbnailUrl = videoData.thumbnail;

      // Upload video file to Firebase Storage if provided
      if (videoFiles.video) {
        const videoRef = ref(storage, `videos/${Date.now()}_${videoFiles.video.name}`);
        const videoSnapshot = await uploadBytes(videoRef, videoFiles.video);
        videoUrl = await getDownloadURL(videoSnapshot.ref);
      }

      // Process custom fields
      const customFields = {};
      videoCustomFields.forEach(field => {
        if (field.key && field.value) {
          customFields[field.key] = field.value;
        }
      });

      // Prepare video data for Firebase
      const videoDataToSave = {
        title: videoData.title,
        instructor: videoData.instructor,
        description: videoData.description || '',
        category: videoData.category || '',
        thumbnail: thumbnailUrl,
        videoUrl: videoUrl,
        duration: videoData.duration || '',
        rating: videoData.rating ? parseFloat(videoData.rating) : 0,
        views: videoData.views ? parseInt(videoData.views) : 0,
        isPublic: videoData.isPublic,
        featured: videoData.featured,
        customFields: customFields,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        teamId: currentUser?.teamId || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save to Firebase Firestore
      await addDoc(collection(db, 'videos'), videoDataToSave);
      
      toast.success('Video uploaded successfully!');
      setSuccess(true);
      
      // Reset form
      setVideoData({
        title: '',
        instructor: '',
        description: '',
        category: '',
        thumbnail: '',
        videoUrl: '',
        duration: '',
        rating: '',
        views: '',
        isPublic: true,
        featured: false,
        teamId: currentUser?.teamId || ''
      });
      setVideoFiles({ video: null });
      setVideoCustomFields([]);
      
      setTimeout(() => {
        setSuccess(false);
        navigate('/videos');
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="upload-page">
        <div className="container">
          <div className="success-message">
            <CheckCircle size={64} className="success-icon" />
            <h2>Upload Successful!</h2>
            <p>Your content has been uploaded to the library.</p>
            <button 
              onClick={() => navigate('/')} 
              className="btn btn-primary"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <div className="container">
        <div className="upload-header">
          <h1>{t.uploadContent}</h1>
          <p>Add books and videos to your library</p>
        </div>

        {/* Tab Navigation */}
        <div className="upload-tabs">
          <button 
            className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => setActiveTab('book')}
          >
            <BookOpen size={20} />
            {t.uploadBook}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            <Play size={20} />
            {t.uploadVideo}
          </button>
        </div>

        {/* Book Upload Form */}
        {activeTab === 'book' && (
          <form onSubmit={handleBookSubmit} className="upload-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="bookTitle">{t.title} *</label>
                <input
                  type="text"
                  id="bookTitle"
                  name="title"
                  value={bookData.title}
                  onChange={handleBookChange}
                  required
                  placeholder="Enter book title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookAuthor">{t.author} *</label>
                <input
                  type="text"
                  id="bookAuthor"
                  name="author"
                  value={bookData.author}
                  onChange={handleBookChange}
                  required
                  placeholder="Enter author name"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="bookDescription">{t.description}</label>
                <textarea
                  id="bookDescription"
                  name="description"
                  value={bookData.description}
                  onChange={handleBookChange}
                  placeholder="Enter book description"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookCategory">{t.category}</label>
                <input
                  type="text"
                  id="bookCategory"
                  name="category"
                  value={bookData.category}
                  onChange={handleBookChange}
                  placeholder="e.g., Fiction, Business, Science"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookCover">Cover Image URL</label>
                <input
                  type="url"
                  id="bookCover"
                  name="cover"
                  value={bookData.cover}
                  onChange={handleBookChange}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookImageFile">
                  Upload Book Cover Image
                  <span className="file-info">(Optional - JPG, PNG, GIF up to 50MB)</span>
                </label>
                <input
                  type="file"
                  id="bookImageFile"
                  name="image"
                  accept="image/*"
                  onChange={handleBookFileChange}
                  className="file-input"
                />
                {bookFiles.image && (
                  <div className="file-preview">
                    <span className="file-name">📷 {bookFiles.image.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setBookFiles(prev => ({ ...prev, image: null }))}
                      className="remove-file"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="bookAudioFile">
                  Upload Audio Book
                  <span className="file-info">(Optional - MP3, WAV, M4A up to 50MB)</span>
                </label>
                <input
                  type="file"
                  id="bookAudioFile"
                  name="audio"
                  accept="audio/*"
                  onChange={handleBookFileChange}
                  className="file-input"
                />
                {bookFiles.audio && (
                  <div className="file-preview">
                    <span className="file-name">🎵 {bookFiles.audio.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setBookFiles(prev => ({ ...prev, audio: null }))}
                      className="remove-file"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="bookPages">{t.pages}</label>
                <input
                  type="number"
                  id="bookPages"
                  name="pages"
                  value={bookData.pages}
                  onChange={handleBookChange}
                  placeholder="Number of pages"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookRating">Rating</label>
                <input
                  type="number"
                  id="bookRating"
                  name="rating"
                  value={bookData.rating}
                  onChange={handleBookChange}
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="0-5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookPrice">Price</label>
                <input
                  type="number"
                  id="bookPrice"
                  name="price"
                  value={bookData.price}
                  onChange={handleBookChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group full-width">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={bookData.isPublic}
                      onChange={handleBookChange}
                    />
                    <span>Make this book public</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={bookData.featured}
                      onChange={handleBookChange}
                    />
                    <span>Feature this book</span>
                  </label>
                </div>
              </div>

              {/* Custom Fields for Books */}
              <div className="form-group full-width">
                <div className="custom-fields-header">
                  <label>Custom Fields</label>
                  <button 
                    type="button" 
                    onClick={addBookCustomField}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={16} />
                    Add Field
                  </button>
                </div>
                {bookCustomFields.map((field, index) => (
                  <div key={index} className="custom-field-row">
                    <input
                      type="text"
                      placeholder="Field name"
                      value={field.key}
                      onChange={(e) => updateBookCustomField(index, 'key', e.target.value)}
                      className="custom-field-key"
                    />
                    <input
                      type="text"
                      placeholder="Field value"
                      value={field.value}
                      onChange={(e) => updateBookCustomField(index, 'value', e.target.value)}
                      className="custom-field-value"
                    />
                    <button
                      type="button"
                      onClick={() => removeBookCustomField(index)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/books')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Upload Book
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Video Upload Form */}
        {activeTab === 'video' && (
          <form onSubmit={handleVideoSubmit} className="upload-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="videoTitle">Title *</label>
                <input
                  type="text"
                  id="videoTitle"
                  name="title"
                  value={videoData.title}
                  onChange={handleVideoChange}
                  required
                  placeholder="Enter video title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="videoInstructor">Instructor *</label>
                <input
                  type="text"
                  id="videoInstructor"
                  name="instructor"
                  value={videoData.instructor}
                  onChange={handleVideoChange}
                  required
                  placeholder="Enter instructor name"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="videoDescription">Description</label>
                <textarea
                  id="videoDescription"
                  name="description"
                  value={videoData.description}
                  onChange={handleVideoChange}
                  placeholder="Enter video description"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="videoCategory">Category</label>
                <input
                  type="text"
                  id="videoCategory"
                  name="category"
                  value={videoData.category}
                  onChange={handleVideoChange}
                  placeholder="e.g., Tutorial, Lecture, Workshop"
                />
              </div>

              <div className="form-group">
                <label htmlFor="videoThumbnail">Thumbnail URL</label>
                <input
                  type="url"
                  id="videoThumbnail"
                  name="thumbnail"
                  value={videoData.thumbnail}
                  onChange={handleVideoChange}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="videoUrl">Video URL</label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  value={videoData.videoUrl}
                  onChange={handleVideoChange}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="videoFile">
                  Upload Video File
                  <span className="file-info">(Optional - MP4, AVI, MOV up to 200MB)</span>
                </label>
                <input
                  type="file"
                  id="videoFile"
                  name="video"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="file-input"
                />
                {videoFiles.video && (
                  <div className="file-preview">
                    <span className="file-name">🎬 {videoFiles.video.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setVideoFiles(prev => ({ ...prev, video: null }))}
                      className="remove-file"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="videoDuration">Duration</label>
                <input
                  type="text"
                  id="videoDuration"
                  name="duration"
                  value={videoData.duration}
                  onChange={handleVideoChange}
                  placeholder="e.g., 15:30"
                />
              </div>

              <div className="form-group">
                <label htmlFor="videoRating">Rating</label>
                <input
                  type="number"
                  id="videoRating"
                  name="rating"
                  value={videoData.rating}
                  onChange={handleVideoChange}
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="0-5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="videoViews">Views</label>
                <input
                  type="number"
                  id="videoViews"
                  name="views"
                  value={videoData.views}
                  onChange={handleVideoChange}
                  min="0"
                  placeholder="Number of views"
                />
              </div>

              <div className="form-group full-width">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={videoData.isPublic}
                      onChange={handleVideoChange}
                    />
                    <span>Make this video public</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={videoData.featured}
                      onChange={handleVideoChange}
                    />
                    <span>Feature this video</span>
                  </label>
                </div>
              </div>

              {/* Custom Fields for Videos */}
              <div className="form-group full-width">
                <div className="custom-fields-header">
                  <label>Custom Fields</label>
                  <button 
                    type="button" 
                    onClick={addVideoCustomField}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={16} />
                    Add Field
                  </button>
                </div>
                {videoCustomFields.map((field, index) => (
                  <div key={index} className="custom-field-row">
                    <input
                      type="text"
                      placeholder="Field name"
                      value={field.key}
                      onChange={(e) => updateVideoCustomField(index, 'key', e.target.value)}
                      className="custom-field-key"
                    />
                    <input
                      type="text"
                      placeholder="Field value"
                      value={field.value}
                      onChange={(e) => updateVideoCustomField(index, 'value', e.target.value)}
                      className="custom-field-value"
                    />
                    <button
                      type="button"
                      onClick={() => removeVideoCustomField(index)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/videos')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Upload Video
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadPage; 