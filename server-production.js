const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Production environment variables
const MYSQL_HOST = process.env.MYSQL_HOST || 'mysql5047.site4now.net';
const MYSQL_USER = process.env.MYSQL_USER || 'a93fb8_bookrea';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || 'Sarah10072012@';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'db_a93fb8_bookrea';
const MYSQL_PORT = process.env.MYSQL_PORT || 3306;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'production';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration for production
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MySQL Configuration with connection pooling
const mysqlConfig = {
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  port: parseInt(MYSQL_PORT),
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create MySQL connection pool
let pool;

const initializeDatabase = async () => {
  try {
    pool = mysql.createPool(mysqlConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
};

// Serve static files from React build
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

[imageUploadsDir, audioUploadsDir, videoUploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'bookImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for book cover'), false);
    }
  } else if (file.fieldname === 'bookAudio') {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed for book audio'), false);
    }
  } else if (file.fieldname === 'videoFile') {
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: pool ? 'connected' : 'disconnected'
  });
});

// User routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName, ...additionalData } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.execute(`
      INSERT INTO users (id, email, password_hash, display_name, phone, location, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, email, hashedPassword, displayName, 
      additionalData.phone || '', 
      additionalData.location || '', 
      additionalData.bio || ''
    ]);

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

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'No account found with this email address.' });
    }

    const user = users[0];
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

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

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

// Books routes
app.get('/api/books', async (req, res) => {
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

    const [books] = await pool.execute(query, params);
    
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

app.get('/api/books/:id', async (req, res) => {
  try {
    const [books] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [req.params.id]
    );
    
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = books[0];

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
]), async (req, res) => {
  try {
    const bookData = req.body;
    const bookId = uuidv4();
    
    let imageFilePath = null;
    let audioFilePath = null;
    
    if (req.files['bookImage'] && req.files['bookImage'][0]) {
      imageFilePath = `/uploads/images/${req.files['bookImage'][0].filename}`;
    }
    
    if (req.files['bookAudio'] && req.files['bookAudio'][0]) {
      audioFilePath = `/uploads/audio/${req.files['bookAudio'][0].filename}`;
    }

    await pool.execute(`
      INSERT INTO books (id, title, author, description, category, cover, pages, rating, price, is_public, featured, user_id, user_name, image_file_path, audio_file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      bookId,
      bookData.title,
      bookData.author,
      bookData.description,
      bookData.category,
      bookData.cover || imageFilePath,
      bookData.pages,
      bookData.rating || 0,
      bookData.price || 0,
      bookData.isPublic === 'true' ? 1 : 0,
      bookData.featured === 'true' ? 1 : 0,
      req.user.userId,
      bookData.userName,
      imageFilePath,
      audioFilePath
    ]);

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

// Videos routes
app.get('/api/videos', async (req, res) => {
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

    const [videos] = await pool.execute(query, params);
    
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

app.get('/api/videos/:id', async (req, res) => {
  try {
    const [videos] = await pool.execute(
      'SELECT * FROM videos WHERE id = ?',
      [req.params.id]
    );
    
    if (videos.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videos[0];

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

// Create a new video endpoint with optional file uploads
app.post('/api/videos', authenticateToken, upload.fields([
  { name: 'videoFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const videoData = req.body;
    const videoId = uuidv4();
    
    let videoFilePath = null;
    
    if (req.files && req.files['videoFile'] && req.files['videoFile'][0]) {
      videoFilePath = `/uploads/videos/${req.files['videoFile'][0].filename}`;
    }

    let isPublic = 1;
    let featured = 0;
    
    if (videoData.isPublic !== undefined) {
      isPublic = (videoData.isPublic === 'true' || videoData.isPublic === true) ? 1 : 0;
    }
    
    if (videoData.featured !== undefined) {
      featured = (videoData.featured === 'true' || videoData.featured === true) ? 1 : 0;
    }

    await pool.execute(`
      INSERT INTO videos (id, title, instructor, description, category, thumbnail, video_url, duration, rating, views, is_public, featured, user_id, user_name, video_file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      videoId,
      videoData.title,
      videoData.instructor,
      videoData.description,
      videoData.category,
      videoData.thumbnail,
      videoData.videoUrl || videoFilePath,
      videoData.duration,
      videoData.rating || 0,
      videoData.views || 0,
      isPublic,
      featured,
      req.user.userId,
      videoData.userName,
      videoFilePath
    ]);

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

// Categories routes
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (pool) {
    pool.end();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (pool) {
    pool.end();
  }
  process.exit(0);
});

// Initialize database and start server
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Production server running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
