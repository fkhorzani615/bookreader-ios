# SQLite Setup for BookReader

This project now uses SQLite instead of Firebase for data storage. The setup includes:

## Architecture

- **Backend Server**: Express.js server with SQLite database
- **Frontend**: React app that communicates with the backend via REST API
- **Database**: SQLite with comprehensive schema for users, books, videos, categories, and orders

## Database Schema

The SQLite database includes the following tables:

- `users` - User accounts and profiles
- `books` - Book information and metadata
- `videos` - Video content and metadata
- `categories` - Content categories
- `orders` - User orders and purchases
- `user_sessions` - Authentication sessions
- `password_reset_tokens` - Password reset functionality

## Running the Application

### Development Mode

1. **Start the SQLite server**:
   ```bash
   npm run server
   ```
   This starts the Express server on port 3001 with SQLite database.

2. **Start the React development server**:
   ```bash
   npm start
   ```
   This starts the React app on port 3000.

3. **Or run both simultaneously**:
   ```bash
   npm run dev
   ```

### Production Mode

1. **Build the React app**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm run server
   ```
   The server will serve the built React app from the `build` directory.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)

### Books
- `GET /api/books` - Get all books (with optional filters)
- `GET /api/books/:id` - Get specific book
- `POST /api/books` - Create new book (requires auth)

### Videos
- `GET /api/videos` - Get all videos (with optional filters)
- `GET /api/videos/:id` - Get specific video
- `POST /api/videos` - Create new video (requires auth)

### Categories
- `GET /api/categories` - Get all categories

### Orders
- `GET /api/orders` - Get user orders (requires auth)
- `POST /api/orders` - Create new order (requires auth)

## Database File

The SQLite database is stored in `bookreader.db` in the project root. This file is created automatically when the server starts for the first time.

## Context Providers

The React app uses several context providers for state management:

- `SQLiteAuthProvider` - User authentication
- `SQLiteBooksProvider` - Books data and operations
- `SQLiteVideosProvider` - Videos data and operations
- `SQLiteCategoriesProvider` - Categories data

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (defaults to http://localhost:3001/api)
- `JWT_SECRET` - Secret for JWT tokens (defaults to 'your-secret-key-change-in-production')

## Migration from Firebase

The project has been migrated from Firebase to SQLite. Key changes:

1. **Authentication**: Now uses JWT tokens with SQLite user sessions
2. **Data Storage**: All data stored in SQLite database instead of Firestore
3. **File Storage**: Still uses external services for file storage (images, videos)
4. **Real-time Updates**: Removed Firebase real-time listeners (can be added back with WebSockets if needed)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection protection with prepared statements
- CORS enabled for cross-origin requests
- Input validation and sanitization

## Performance

- SQLite provides fast local data access
- Indexed queries for better performance
- Connection pooling for concurrent requests
- Efficient data filtering and sorting

## Backup and Maintenance

- Database file can be backed up directly
- Regular cleanup of expired sessions and tokens
- Database integrity maintained with foreign key constraints
