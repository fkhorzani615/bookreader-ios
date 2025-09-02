# Firebase to SQLite Migration Guide

This guide will help you migrate your BookReader application from Firebase to SQLite. The migration includes authentication, books, videos, and user data.

## 🎯 What's Being Migrated

### Data Migration
- **Authentication**: User registration, login, password reset
- **Books**: All book data with metadata (title, author, description, etc.)
- **Videos**: All video data with metadata (title, instructor, description, etc.)
- **User Profiles**: User preferences, subscription data, favorites
- **Orders**: Shopping cart and order history
- **Categories**: Book and video categories

### Features Preserved
- User authentication and sessions
- Book and video management
- User profiles and preferences
- Shopping cart functionality
- Search and filtering
- Upload functionality

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **SQLite3** (included with Node.js)

## 🚀 Migration Steps

### Step 1: Install Dependencies

```bash
npm install bcryptjs jsonwebtoken sqlite sqlite3
```

### Step 2: Database Setup

The SQLite database will be automatically created when you first run the application. The database file will be created as `bookreader.db` in your project root.

### Step 3: Update Your Application

1. **Replace the main App.js**:
   ```bash
   cp src/App-SQLite.js src/App.js
   ```

2. **Update authentication pages**:
   ```bash
   cp src/pages/Login-SQLite.js src/pages/Login.js
   cp src/pages/Register-SQLite.js src/pages/Register.js
   ```

3. **Update other pages to use SQLite contexts**:
   - Replace `useAuth` with `useSQLiteAuth`
   - Replace Firebase imports with SQLite database calls

### Step 4: Data Migration (Optional)

If you have existing Firebase data that you want to migrate:

1. **Set up your Firebase credentials** in your `.env` file:
   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

2. **Run the migration script**:
   ```bash
   node src/database/migrate.js
   ```

### Step 5: Test the Application

```bash
npm start
```

## 📁 New File Structure

```
src/
├── database/
│   ├── schema.sql          # SQLite database schema
│   ├── database.js         # SQLite database connection and methods
│   └── migrate.js          # Firebase to SQLite migration script
├── context/
│   ├── SQLiteAuthContext.js    # Authentication context
│   ├── SQLiteBooksContext.js   # Books context
│   └── SQLiteVideosContext.js  # Videos context
└── pages/
    ├── Login-SQLite.js     # Updated login page
    └── Register-SQLite.js  # Updated register page
```

## 🔧 Database Schema

### Users Table
- `id`: Unique user identifier
- `email`: User email (unique)
- `password_hash`: Hashed password
- `display_name`: User's display name
- `phone`, `location`, `bio`: Optional user info
- `subscription_plan`, `subscription_status`: Subscription data
- `watch_history`, `favorites`: JSON arrays
- `preferences`: JSON object for user settings

### Books Table
- `id`: Unique book identifier
- `title`, `author`, `description`: Book metadata
- `category`: Book category
- `cover`: Cover image URL
- `pages`, `rating`, `price`: Book details
- `is_public`, `featured`: Visibility flags
- `user_id`, `user_name`: Creator info

### Videos Table
- `id`: Unique video identifier
- `title`, `instructor`, `description`: Video metadata
- `category`: Video category
- `thumbnail`, `video_url`: Media URLs
- `duration`, `rating`, `views`: Video stats
- `is_public`, `featured`: Visibility flags
- `user_id`, `user_name`: Creator info

### Additional Tables
- `categories`: Book and video categories
- `orders`: Shopping cart orders
- `order_items`: Order details
- `user_sessions`: Authentication sessions
- `password_reset_tokens`: Password reset functionality

## 🔐 Authentication Changes

### Before (Firebase)
```javascript
import { useAuth } from '../context/AuthContext';

const { login, signup, logout } = useAuth();
```

### After (SQLite)
```javascript
import { useSQLiteAuth } from '../context/SQLiteAuthContext';

const { login, signup, logout } = useSQLiteAuth();
```

## 📚 Books Context Changes

### Before (Firebase)
```javascript
import { BookContext } from '../context/books';

const { books, featured, loading } = useContext(BookContext);
```

### After (SQLite)
```javascript
import SQLiteBooksContext from '../context/SQLiteBooksContext';

const { books, featured, loading } = useContext(SQLiteBooksContext);
```

## 🎥 Videos Context Changes

### Before (Firebase)
```javascript
// Direct Firebase calls in components
const videosSnapshot = await getDocs(collection(db, 'videos'));
```

### After (SQLite)
```javascript
import SQLiteVideosContext from '../context/SQLiteVideosContext';

const { videos, featured, loading } = useContext(SQLiteVideosContext);
```

## 🛠️ Environment Variables

Update your `.env` file:

```env
# Remove Firebase variables (optional - keep for migration)
# REACT_APP_FIREBASE_API_KEY=...
# REACT_APP_FIREBASE_AUTH_DOMAIN=...

# Add SQLite configuration
JWT_SECRET=your-secret-key-change-in-production
```

## 🔍 Key Differences

### Authentication
- **Firebase**: Cloud-based authentication with real-time updates
- **SQLite**: Local authentication with JWT tokens and sessions

### Data Storage
- **Firebase**: Cloud Firestore with real-time synchronization
- **SQLite**: Local database with manual state management

### Scalability
- **Firebase**: Automatic scaling, works across devices
- **SQLite**: Local storage, single-device access

### Offline Support
- **Firebase**: Built-in offline support with sync
- **SQLite**: Always available offline, no sync needed

## 🚨 Important Notes

1. **Data Persistence**: SQLite data is stored locally. If you need cloud backup, implement a separate solution.

2. **Multi-device**: SQLite is local to each device. Users will need to create accounts on each device.

3. **Backup**: Implement regular backups of the `bookreader.db` file.

4. **Security**: The JWT secret should be changed in production.

5. **Performance**: SQLite is very fast for local operations but doesn't scale across multiple users.

## 🐛 Troubleshooting

### Common Issues

1. **Database not found**:
   - Ensure the database file has write permissions
   - Check that the database path is correct

2. **Authentication errors**:
   - Clear localStorage and try logging in again
   - Check that the JWT secret is set correctly

3. **Migration errors**:
   - Verify Firebase credentials are correct
   - Check that Firebase project has the required collections

### Debug Commands

```bash
# Check database file
ls -la bookreader.db

# View database contents (requires sqlite3 CLI)
sqlite3 bookreader.db ".tables"
sqlite3 bookreader.db "SELECT * FROM users;"
```

## 📈 Performance Benefits

- **Faster queries**: No network latency
- **Offline-first**: Works without internet
- **Reduced costs**: No Firebase usage fees
- **Privacy**: Data stays on user's device

## 🔄 Rollback Plan

If you need to revert to Firebase:

1. Keep the original Firebase files
2. Restore the original `App.js`
3. Restore original authentication contexts
4. Update environment variables

## 📞 Support

If you encounter issues during migration:

1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure the database file has proper permissions
4. Review the migration logs

## 🎉 Migration Complete!

After completing the migration, your application will:

- ✅ Use SQLite for all data storage
- ✅ Maintain all existing functionality
- ✅ Work offline
- ✅ Have faster local performance
- ✅ Reduce cloud dependency

The migration preserves all your existing features while providing a more self-contained, offline-capable solution.
