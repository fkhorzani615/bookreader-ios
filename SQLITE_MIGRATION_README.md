# SQLite Migration Guide

This guide will help you migrate your BookReader application from Firebase to SQLite for local data storage and authentication.

## 🎯 What's Included

- **Complete SQLite Database Schema** - Replaces Firebase Firestore collections
- **JWT-based Authentication** - Replaces Firebase Auth
- **React Context Providers** - Seamless integration with existing components
- **Data Migration Scripts** - Transfer existing Firebase data to SQLite
- **Updated UI Components** - Login, Register, and Home pages for SQLite

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Existing Firebase project (for data migration)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install bcryptjs jsonwebtoken sqlite sqlite3
```

### 2. Initialize Database and Add Sample Data

```bash
node test-sqlite-setup.js
```

This will:
- Create the SQLite database
- Add sample books and videos
- Create a test user (email: `test@example.com`, password: `password123`)

### 3. Switch to SQLite Version

```bash
node switch-to-sqlite.js
```

This will:
- Backup your current Firebase files
- Replace them with SQLite versions
- Update package.json

### 4. Start the Application

```bash
npm start
```

## 📊 Database Schema

The SQLite database includes the following tables:

### Users Table
- Replaces Firebase Auth + user profiles
- Stores user information, preferences, and subscription data
- Includes password hashing and session management

### Books Table
- Replaces Firestore books collection
- Stores book metadata, ratings, and user associations

### Videos Table
- Replaces Firestore videos collection
- Stores video metadata, views, and user associations

### Categories Table
- Organizes books and videos by category
- Includes predefined categories with icons

### Orders Table
- Replaces Firestore orders collection
- Tracks user purchases and order history

## 🔐 Authentication System

### Features
- **JWT Tokens** - Secure session management
- **Password Hashing** - Using bcryptjs for security
- **Session Persistence** - Tokens stored in localStorage
- **Password Reset** - Email-based reset functionality

### Usage
```javascript
import { useSQLiteAuth } from './context/SQLiteAuthContext';

const { signup, login, logout, currentUser } = useSQLiteAuth();
```

## 📚 Data Management

### Books Context
```javascript
import { useSQLiteBooks } from './context/SQLiteBooksContext';

const { books, loading, fetchBooks, createBook } = useSQLiteBooks();
```

### Videos Context
```javascript
import { useSQLiteVideos } from './context/SQLiteVideosContext';

const { videos, loading, fetchVideos, createVideo } = useSQLiteVideos();
```

## 🔄 Data Migration

If you have existing Firebase data, use the migration script:

```bash
node src/database/migrate.js
```

**Note**: You'll need to provide your Firebase configuration in the migration script.

## 📁 File Structure

```
src/
├── database/
│   ├── database.js          # SQLite database interface
│   ├── schema.sql           # Database schema
│   └── migrate.js           # Firebase to SQLite migration
├── context/
│   ├── SQLiteAuthContext.js # Authentication context
│   ├── SQLiteBooksContext.js # Books management context
│   └── SQLiteVideosContext.js # Videos management context
├── pages/
│   ├── Home-SQLite.js       # Updated home page
│   ├── Login-SQLite.js      # Updated login page
│   └── Register-SQLite.js   # Updated register page
└── App-SQLite.js           # Main app with SQLite providers
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with:

```env
JWT_SECRET=your-secret-key-here
DATABASE_PATH=./bookreader.db
```

### Database Path
The SQLite database file will be created at `./bookreader.db` by default.

## 🎨 UI Changes

### Updated Components
- **Home Page** - Now fetches data from SQLite contexts
- **Login Page** - Uses SQLite authentication
- **Register Page** - Creates users in SQLite database
- **Loading States** - Added for better UX during data fetching

### Features Maintained
- ✅ Search and filtering
- ✅ Category organization
- ✅ Rating system
- ✅ User profiles
- ✅ Responsive design

## 🚨 Important Notes

### Performance Benefits
- **Faster Queries** - Local database eliminates network latency
- **Offline Support** - Data available without internet connection
- **Reduced Costs** - No Firebase usage fees
- **Full Control** - Complete ownership of data and infrastructure

### Limitations
- **No Real-time Updates** - Unlike Firebase's real-time listeners
- **Local Storage Only** - Data not synced across devices
- **Manual Backups** - Need to implement backup strategy

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check if database file exists
   ls -la bookreader.db
   
   # Reinitialize database
   node test-sqlite-setup.js
   ```

2. **Authentication Issues**
   ```bash
   # Clear localStorage
   localStorage.clear()
   
   # Restart application
   npm start
   ```

3. **Missing Dependencies**
   ```bash
   npm install bcryptjs jsonwebtoken sqlite sqlite3
   ```

### Rollback to Firebase

If you need to revert to Firebase:

1. Restore files from `firebase-backup/` directory
2. Remove SQLite dependencies from package.json
3. Restart the application

## 📈 Testing

### Test Credentials
- **Email**: `test@example.com`
- **Password**: `password123`

### Test Data
The setup script creates:
- 3 sample books (Programming, Data Science, Design)
- 3 sample videos (React, Machine Learning, UI/UX)
- 1 test user with profile data

## 🔮 Future Enhancements

- **Real-time Updates** - Implement WebSocket connections
- **Data Synchronization** - Sync across multiple devices
- **Advanced Search** - Full-text search capabilities
- **Backup System** - Automated database backups
- **User Permissions** - Role-based access control

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the console for error messages
3. Verify all dependencies are installed
4. Ensure the database file has proper permissions

## 🎉 Success!

Once migration is complete, you'll have:
- ✅ Local data storage with SQLite
- ✅ JWT-based authentication
- ✅ All existing features working
- ✅ Better performance and control
- ✅ No dependency on external services

Your BookReader application is now fully self-contained and ready for local deployment!

