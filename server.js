const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different file types
const imageUploadsDir = path.join(uploadsDir, 'images');
const audioUploadsDir = path.join(uploadsDir, 'audio');
const videoUploadsDir = path.join(uploadsDir, 'videos');

if (!fs.existsSync(imageUploadsDir)) {
  fs.mkdirSync(imageUploadsDir, { recursive: true });
}

if (!fs.existsSync(audioUploadsDir)) {
  fs.mkdirSync(audioUploadsDir, { recursive: true });
}

if (!fs.existsSync(videoUploadsDir)) {
  fs.mkdirSync(videoUploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'bookImage') {
      cb(null, imageUploadsDir);
    } else if (file.fieldname === 'bookAudio') {
      cb(null, audioUploadsDir);
    } else if (file.fieldname === 'videoFile') {
      cb(null, videoUploadsDir);
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'bookImage') {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for book cover'), false);
    }
  } else if (file.fieldname === 'bookAudio') {
    // Accept only audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for book audio'), false);
    }
  } else if (file.fieldname === 'videoFile') {
    // Accept only video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit for videos
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Initialize SQLite database
const db = new Database('bookreader.db');

// Read and execute schema
const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

// Add new columns for file uploads if they don't exist
try {
  db.exec(`
    ALTER TABLE books ADD COLUMN image_file_path TEXT;
  `);
} catch (error) {
  // Column might already exist, ignore error
}

try {
  db.exec(`
    ALTER TABLE books ADD COLUMN audio_file_path TEXT;
  `);
} catch (error) {
  // Column might already exist, ignore error
}

try {
  db.exec(`
    ALTER TABLE videos ADD COLUMN video_file_path TEXT;
  `);
} catch (error) {
  // Column might already exist, ignore error
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// User routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName, ...additionalData } = req.body;

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);

    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, phone, location, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(userId, email, hashedPassword, displayName, 
      additionalData.phone || '', 
      additionalData.location || '', 
      additionalData.bio || ''
    );

    res.json({
      user: { uid: userId, email, displayName },
      userProfile: {
        uid: userId,
        email,
        displayName,
        phone: additionalData.phone || '',
        location: additionalData.location || '',
        bio: additionalData.bio || '',
        createdAt: new Date(),
        subscription: { plan: 'free', status: 'active', expiresAt: null },
        watchHistory: [],
        favorites: [],
        preferences: { language: 'en', quality: 'auto', autoplay: true }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);
    
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email address.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.display_name,
        isAdmin: user.is_admin === 1
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      uid: user.id,
      email: user.email,
      displayName: user.display_name,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      createdAt: user.created_at,
      subscription: {
        plan: user.subscription_plan,
        status: user.subscription_status,
        expiresAt: user.subscription_expires_at
      },
      watchHistory: user.watch_history ? JSON.parse(user.watch_history) : [],
      favorites: user.favorites ? JSON.parse(user.favorites) : [],
      preferences: user.preferences ? JSON.parse(user.preferences) : {
        language: 'en',
        quality: 'auto',
        autoplay: true
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, email, phone, location, bio, currentPassword, newPassword } = req.body;
    
    // Get current user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }
      
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Check if email is already taken (if changing email)
    if (email && email !== user.email) {
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.userId);
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    // Prepare update data
    const updates = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (location !== undefined) updates.location = location;
    if (bio !== undefined) updates.bio = bio;
    if (newPassword) {
      updates.password_hash = await bcrypt.hash(newPassword, 10);
    }
    updates.updated_at = new Date().toISOString();

    // Build dynamic query
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(req.user.userId);

    const updateStmt = db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
    updateStmt.run(...values);

    // Return updated user data
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
    
    res.json({
      uid: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.display_name,
      phone: updatedUser.phone,
      location: updatedUser.location,
      bio: updatedUser.bio,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
      subscription: {
        plan: updatedUser.subscription_plan,
        status: updatedUser.subscription_status,
        expiresAt: updatedUser.subscription_expires_at
      },
      watchHistory: updatedUser.watch_history ? JSON.parse(updatedUser.watch_history) : [],
      favorites: updatedUser.favorites ? JSON.parse(updatedUser.favorites) : [],
      preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences) : {
        language: 'en',
        quality: 'auto',
        autoplay: true
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Books routes
app.get('/api/books', (req, res) => {
  try {
    const { isPublic, featured, category, userId } = req.query;
    
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (isPublic !== undefined) {
      query += ' AND is_public = ?';
      params.push(isPublic === 'true' ? 1 : 0);
    }

    if (featured !== undefined) {
      query += ' AND featured = ?';
      params.push(featured === 'true' ? 1 : 0);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';

    const books = db.prepare(query).all(...params);
    
    // Transform to camelCase for frontend compatibility
    const transformedBooks = books.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      cover: book.cover,
      pages: book.pages,
      rating: book.rating,
      price: book.price,
      isPublic: book.is_public === 1,
      featured: book.featured === 1,
      userId: book.user_id,
      userName: book.user_name,
      teamId: book.team_id,
      createdAt: book.created_at,
      updatedAt: book.updated_at,
      imageFilePath: book.image_file_path,
      audioFilePath: book.audio_file_path
    }));

    res.json(transformedBooks);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Failed to get books' });
  }
});

app.get('/api/books/:id', (req, res) => {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Transform to camelCase for frontend compatibility
    const transformedBook = {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      cover: book.cover,
      pages: book.pages,
      rating: book.rating,
      price: book.price,
      isPublic: book.is_public === 1,
      featured: book.featured === 1,
      userId: book.user_id,
      userName: book.user_name,
      teamId: book.team_id,
      createdAt: book.created_at,
      updatedAt: book.updated_at,
      imageFilePath: book.image_file_path,
      audioFilePath: book.audio_file_path
    };

    res.json(transformedBook);
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Failed to get book' });
  }
});

// Create a new book endpoint with file uploads
app.post('/api/books', authenticateToken, upload.fields([
  { name: 'bookImage', maxCount: 1 },
  { name: 'bookAudio', maxCount: 1 }
]), (req, res) => {
  try {
    const bookData = req.body;
    const bookId = uuidv4();
    
    // Handle uploaded files
    let imageFilePath = null;
    let audioFilePath = null;
    
    if (req.files['bookImage'] && req.files['bookImage'][0]) {
      imageFilePath = `/uploads/images/${req.files['bookImage'][0].filename}`;
    }
    
    if (req.files['bookAudio'] && req.files['bookAudio'][0]) {
      audioFilePath = `/uploads/audio/${req.files['bookAudio'][0].filename}`;
    }

    const stmt = db.prepare(`
      INSERT INTO books (id, title, author, description, category, cover, pages, rating, price, is_public, featured, user_id, user_name, image_file_path, audio_file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      bookId,
      bookData.title,
      bookData.author,
      bookData.description,
      bookData.category,
      bookData.cover || imageFilePath, // Use uploaded image or provided URL
      bookData.pages,
      bookData.rating || 0,
      bookData.price || 0,
      bookData.isPublic === 'true' ? 1 : 0, // Handle string to boolean conversion
      bookData.featured === 'true' ? 1 : 0,
      req.user.userId,
      bookData.userName,
      imageFilePath,
      audioFilePath
    );

    const responseData = {
      id: bookId,
      ...bookData,
      imageFilePath,
      audioFilePath,
      isPublic: bookData.isPublic === 'true',
      featured: bookData.featured === 'true'
    };

    res.json(responseData);
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// Update book (only by owner)
app.put('/api/books/:id', authenticateToken, (req, res) => {
  try {
    const bookId = req.params.id;
    const bookData = req.body;

    // Check if book exists and user is the owner
    const existingBook = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?').get(bookId, req.user.userId);
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found or you do not have permission to edit it' });
    }

    // Prepare update data
    const updates = {
      title: bookData.title || existingBook.title,
      author: bookData.author || existingBook.author,
      description: bookData.description || existingBook.description,
      category: bookData.category || existingBook.category,
      cover: bookData.cover || existingBook.cover,
      pages: bookData.pages || existingBook.pages,
      rating: bookData.rating !== undefined ? bookData.rating : existingBook.rating,
      price: bookData.price !== undefined ? bookData.price : existingBook.price,
      is_public: bookData.isPublic !== undefined ? (bookData.isPublic ? 1 : 0) : existingBook.is_public,
      featured: bookData.featured !== undefined ? (bookData.featured ? 1 : 0) : existingBook.featured,
      updated_at: new Date().toISOString()
    };

    const updateStmt = db.prepare(`
      UPDATE books SET 
        title = ?, author = ?, description = ?, category = ?, cover = ?, 
        pages = ?, rating = ?, price = ?, is_public = ?, featured = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    updateStmt.run(
      updates.title, updates.author, updates.description, updates.category, updates.cover,
      updates.pages, updates.rating, updates.price, updates.is_public, updates.featured, updates.updated_at,
      bookId, req.user.userId
    );

    // Get and return updated book
    const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
    
    // Transform to camelCase for frontend compatibility
    const transformedBook = {
      id: updatedBook.id,
      title: updatedBook.title,
      author: updatedBook.author,
      description: updatedBook.description,
      category: updatedBook.category,
      cover: updatedBook.cover,
      pages: updatedBook.pages,
      rating: updatedBook.rating,
      price: updatedBook.price,
      isPublic: updatedBook.is_public === 1,
      featured: updatedBook.featured === 1,
      userId: updatedBook.user_id,
      userName: updatedBook.user_name,
      teamId: updatedBook.team_id,
      createdAt: updatedBook.created_at,
      updatedAt: updatedBook.updated_at
    };

    res.json(transformedBook);
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Delete book (only by owner)
app.delete('/api/books/:id', authenticateToken, (req, res) => {
  try {
    const bookId = req.params.id;

    // Check if book exists and user is the owner
    const existingBook = db.prepare('SELECT * FROM books WHERE id = ? AND user_id = ?').get(bookId, req.user.userId);
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found or you do not have permission to delete it' });
    }

    // Delete the book
    const deleteStmt = db.prepare('DELETE FROM books WHERE id = ? AND user_id = ?');
    const result = deleteStmt.run(bookId, req.user.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Book not found or already deleted' });
    }

    res.json({ message: 'Book deleted successfully', id: bookId });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Videos routes
app.get('/api/videos', (req, res) => {
  try {
    const { isPublic, featured, category, userId } = req.query;
    
    let query = 'SELECT * FROM videos WHERE 1=1';
    const params = [];

    if (isPublic !== undefined) {
      query += ' AND is_public = ?';
      params.push(isPublic === 'true' ? 1 : 0);
    }

    if (featured !== undefined) {
      query += ' AND featured = ?';
      params.push(featured === 'true' ? 1 : 0);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';

    const videos = db.prepare(query).all(...params);
    
    // Transform to camelCase for frontend compatibility
    const transformedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      instructor: video.instructor,
      description: video.description,
      category: video.category,
      thumbnail: video.thumbnail,
      videoUrl: video.video_url,
      duration: video.duration,
      rating: video.rating,
      views: video.views,
      isPublic: video.is_public === 1,
      featured: video.featured === 1,
      userId: video.user_id,
      userName: video.user_name,
      teamId: video.team_id,
      createdAt: video.created_at,
      updatedAt: video.updated_at,
      videoFilePath: video.video_file_path
    }));

    res.json(transformedVideos);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to get videos' });
  }
});

app.get('/api/videos/:id', (req, res) => {
  try {
    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Transform to camelCase for frontend compatibility
    const transformedVideo = {
      id: video.id,
      title: video.title,
      instructor: video.instructor,
      description: video.description,
      category: video.category,
      thumbnail: video.thumbnail,
      videoUrl: video.video_url,
      duration: video.duration,
      rating: video.rating,
      views: video.views,
      isPublic: video.is_public === 1,
      featured: video.featured === 1,
      userId: video.user_id,
      userName: video.user_name,
      teamId: video.team_id,
      createdAt: video.created_at,
      updatedAt: video.updated_at,
      videoFilePath: video.video_file_path
    };

    res.json(transformedVideo);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to get video' });
  }
});

// Conditional multer middleware for videos
const conditionalVideoUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    // Use multer for multipart data
    upload.fields([{ name: 'videoFile', maxCount: 1 }])(req, res, next);
  } else {
    // Skip multer for JSON data
    next();
  }
};

// Create a new video endpoint with optional file uploads
app.post('/api/videos', authenticateToken, conditionalVideoUpload, (req, res) => {
  try {
    // Debug logging (can be removed in production)
    // console.log('Create video request body:', req.body);
    // console.log('Create video files:', req.files);
    // console.log('User from token:', req.user);
    
    const videoData = req.body;
    const videoId = uuidv4();
    
    // Handle uploaded video file
    let videoFilePath = null;
    
    if (req.files && req.files['videoFile'] && req.files['videoFile'][0]) {
      videoFilePath = `/uploads/videos/${req.files['videoFile'][0].filename}`;
    }

    // Handle boolean conversions properly for both multipart and JSON
    let isPublic = 1; // default to public
    let featured = 0; // default to not featured
    
    if (videoData.isPublic !== undefined) {
      isPublic = (videoData.isPublic === 'true' || videoData.isPublic === true) ? 1 : 0;
    }
    
    if (videoData.featured !== undefined) {
      featured = (videoData.featured === 'true' || videoData.featured === true) ? 1 : 0;
    }

    const stmt = db.prepare(`
      INSERT INTO videos (id, title, instructor, description, category, thumbnail, video_url, duration, rating, views, is_public, featured, user_id, user_name, video_file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      videoId,
      videoData.title,
      videoData.instructor,
      videoData.description,
      videoData.category,
      videoData.thumbnail,
      videoData.videoUrl || videoFilePath, // Use uploaded video or provided URL
      videoData.duration,
      videoData.rating || 0,
      videoData.views || 0,
      isPublic,
      featured,
      req.user.userId,
      videoData.userName,
      videoFilePath
    );

    const responseData = {
      id: videoId,
      ...videoData,
      videoFilePath,
      isPublic: isPublic === 1,
      featured: featured === 1
    };

    res.json(responseData);
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// Update video (only by owner)
app.put('/api/videos/:id', authenticateToken, (req, res) => {
  try {
    const videoId = req.params.id;
    const videoData = req.body;

    // Check if video exists and user is the owner
    const existingVideo = db.prepare('SELECT * FROM videos WHERE id = ? AND user_id = ?').get(videoId, req.user.userId);
    if (!existingVideo) {
      return res.status(404).json({ error: 'Video not found or you do not have permission to edit it' });
    }

    // Prepare update data
    const updates = {
      title: videoData.title || existingVideo.title,
      instructor: videoData.instructor || existingVideo.instructor,
      description: videoData.description || existingVideo.description,
      category: videoData.category || existingVideo.category,
      thumbnail: videoData.thumbnail || existingVideo.thumbnail,
      video_url: videoData.videoUrl || existingVideo.video_url,
      duration: videoData.duration || existingVideo.duration,
      rating: videoData.rating !== undefined ? videoData.rating : existingVideo.rating,
      views: videoData.views !== undefined ? videoData.views : existingVideo.views,
      is_public: videoData.isPublic !== undefined ? (videoData.isPublic ? 1 : 0) : existingVideo.is_public,
      featured: videoData.featured !== undefined ? (videoData.featured ? 1 : 0) : existingVideo.featured,
      updated_at: new Date().toISOString()
    };

    const updateStmt = db.prepare(`
      UPDATE videos SET 
        title = ?, instructor = ?, description = ?, category = ?, thumbnail = ?, 
        video_url = ?, duration = ?, rating = ?, views = ?, is_public = ?, featured = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    updateStmt.run(
      updates.title, updates.instructor, updates.description, updates.category, updates.thumbnail,
      updates.video_url, updates.duration, updates.rating, updates.views, updates.is_public, updates.featured, updates.updated_at,
      videoId, req.user.userId
    );

    // Get and return updated video
    const updatedVideo = db.prepare('SELECT * FROM videos WHERE id = ?').get(videoId);
    
    // Transform to camelCase for frontend compatibility
    const transformedVideo = {
      id: updatedVideo.id,
      title: updatedVideo.title,
      instructor: updatedVideo.instructor,
      description: updatedVideo.description,
      category: updatedVideo.category,
      thumbnail: updatedVideo.thumbnail,
      videoUrl: updatedVideo.video_url,
      duration: updatedVideo.duration,
      rating: updatedVideo.rating,
      views: updatedVideo.views,
      isPublic: updatedVideo.is_public === 1,
      featured: updatedVideo.featured === 1,
      userId: updatedVideo.user_id,
      userName: updatedVideo.user_name,
      teamId: updatedVideo.team_id,
      createdAt: updatedVideo.created_at,
      updatedAt: updatedVideo.updated_at
    };

    res.json(transformedVideo);
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video (only by owner)
app.delete('/api/videos/:id', authenticateToken, (req, res) => {
  try {
    const videoId = req.params.id;

    // Check if video exists and user is the owner
    const existingVideo = db.prepare('SELECT * FROM videos WHERE id = ? AND user_id = ?').get(videoId, req.user.userId);
    if (!existingVideo) {
      return res.status(404).json({ error: 'Video not found or you do not have permission to delete it' });
    }

    // Delete the video
    const deleteStmt = db.prepare('DELETE FROM videos WHERE id = ? AND user_id = ?');
    const result = deleteStmt.run(videoId, req.user.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Video not found or already deleted' });
    }

    res.json({ message: 'Video deleted successfully', id: videoId });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Categories routes
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Orders routes
app.post('/api/orders', authenticateToken, (req, res) => {
  try {
    const orderData = req.body;
    const orderId = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO orders (id, user_id, total, status, address)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(orderId, req.user.userId, orderData.total, orderData.status || 'pending', orderData.address);

    res.json({ id: orderId, ...orderData });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.userId);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Sample data endpoints for testing
app.post('/api/sample/books', async (req, res) => {
  try {
    // First, create a sample user if it doesn't exist
    const sampleUserId = 'sample-user-id';
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(sampleUserId);
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('samplepassword', 12);
      const userStmt = db.prepare(`
        INSERT INTO users (id, email, password_hash, display_name, is_admin, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      userStmt.run(sampleUserId, 'sample@example.com', hashedPassword, 'Sample User', 0, 1);
    }

    const sampleBooks = [
      {
        id: uuidv4(),
        title: 'The Art of Programming',
        author: 'John Smith',
        description: 'A comprehensive guide to modern programming techniques and best practices.',
        category: 'Programming',
        cover: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400',
        pages: 450,
        rating: 4.8,
        price: 29.99,
        is_public: 1,
        featured: 1,
        user_id: sampleUserId,
        user_name: 'Sample Author',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Machine Learning Fundamentals',
        author: 'Sarah Johnson',
        description: 'Learn the basics of machine learning algorithms and their applications.',
        category: 'Technology',
        cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        pages: 320,
        rating: 4.6,
        price: 24.99,
        is_public: 1,
        featured: 1,
        user_id: sampleUserId,
        user_name: 'Sample Author',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Business Strategy for Startups',
        author: 'Michael Chen',
        description: 'Essential strategies for building and scaling successful startups.',
        category: 'Business',
        cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
        pages: 280,
        rating: 4.4,
        price: 19.99,
        is_public: 1,
        featured: 0,
        user_id: sampleUserId,
        user_name: 'Sample Author',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'The Psychology of Success',
        author: 'Lisa Brown',
        description: 'Understanding the mental frameworks that lead to personal and professional success.',
        category: 'Self-Help',
        cover: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        pages: 350,
        rating: 4.7,
        price: 22.99,
        is_public: 1,
        featured: 1,
        user_id: sampleUserId,
        user_name: 'Sample Author',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const stmt = db.prepare(`
      INSERT INTO books (id, title, author, description, category, cover, pages, rating, price, is_public, featured, user_id, user_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const book of sampleBooks) {
      stmt.run(
        book.id,
        book.title,
        book.author,
        book.description,
        book.category,
        book.cover,
        book.pages,
        book.rating,
        book.price,
        book.is_public,
        book.featured,
        book.user_id,
        book.user_name,
        book.created_at,
        book.updated_at
      );
    }

    res.json({ message: 'Sample books added successfully', count: sampleBooks.length });
  } catch (error) {
    console.error('Add sample books error:', error);
    res.status(500).json({ error: 'Failed to add sample books' });
  }
});

app.post('/api/sample/videos', async (req, res) => {
  try {
    // Use the same sample user ID
    const sampleUserId = 'sample-user-id';
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(sampleUserId);
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('samplepassword', 12);
      const userStmt = db.prepare(`
        INSERT INTO users (id, email, password_hash, display_name, is_admin, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      userStmt.run(sampleUserId, 'sample@example.com', hashedPassword, 'Sample User', 0, 1);
    }

    const sampleVideos = [
      {
        id: uuidv4(),
        title: 'Introduction to React Development',
        instructor: 'David Wilson',
        description: 'Learn React fundamentals and build your first application.',
        category: 'Programming',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        video_url: 'https://sample-videos.com/react-intro.mp4',
        duration: '01:30:00',
        rating: 4.8,
        views: 1250,
        is_public: 1,
        featured: 1,
        user_id: sampleUserId,
        user_name: 'Sample Instructor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Advanced JavaScript Concepts',
        instructor: 'Emily Rodriguez',
        description: 'Deep dive into advanced JavaScript patterns and techniques.',
        category: 'Programming',
        thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400',
        video_url: 'https://sample-videos.com/js-advanced.mp4',
        duration: '02:15:00',
        rating: 4.6,
        views: 890,
        is_public: 1,
        featured: 1,
        user_id: sampleUserId,
        user_name: 'Sample Instructor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'UI/UX Design Principles',
        instructor: 'Alex Thompson',
        description: 'Master the fundamentals of user interface and user experience design.',
        category: 'Design',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        video_url: 'https://sample-videos.com/uiux-design.mp4',
        duration: '01:45:00',
        rating: 4.4,
        views: 650,
        is_public: 1,
        featured: 0,
        user_id: sampleUserId,
        user_name: 'Sample Instructor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Data Science Fundamentals',
        instructor: 'Maria Garcia',
        description: 'Introduction to data science, statistics, and machine learning.',
        category: 'Technology',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        video_url: 'https://sample-videos.com/data-science.mp4',
        duration: '02:30:00',
        rating: 4.9,
        views: 2100,
        is_public: 1,
        featured: 1,
        user_id: sampleUserId,
        user_name: 'Sample Instructor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const stmt = db.prepare(`
      INSERT INTO videos (id, title, instructor, description, category, thumbnail, video_url, duration, rating, views, is_public, featured, user_id, user_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const video of sampleVideos) {
      stmt.run(
        video.id,
        video.title,
        video.instructor,
        video.description,
        video.category,
        video.thumbnail,
        video.video_url,
        video.duration,
        video.rating,
        video.views,
        video.is_public,
        video.featured,
        video.user_id,
        video.user_name,
        video.created_at,
        video.updated_at
      );
    }

    res.json({ message: 'Sample videos added successfully', count: sampleVideos.length });
  } catch (error) {
    console.error('Add sample videos error:', error);
    res.status(500).json({ error: 'Failed to add sample videos' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
