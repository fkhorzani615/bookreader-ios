# Firebase Setup for BookReader

## Overview
This application is now configured to use Firebase as the primary data source for videos, books, and categories. The Firebase configuration has been set up with your provided credentials.

## Firebase Configuration
The application uses the following Firebase configuration:
- **Project ID**: bookreader-54669
- **API Key**: AIzaSyDxql4hc82vl-G_IMZEnzheo9G7QEhcKeQ
- **Auth Domain**: bookreader-54669.firebaseapp.com
- **Storage Bucket**: bookreader-54669.firebasestorage.app

## Data Structure

### Collections

#### 1. Categories Collection
```javascript
{
  name: "Programming",
  description: "Learn coding and software development",
  color: "#3B82F6",
  icon: "💻",
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 2. Videos Collection
```javascript
{
  title: "React Fundamentals",
  description: "Learn the basics of React.js...",
  category: "Programming",
  videoUrl: "https://sample-videos.com/...",
  thumbnailUrl: "https://images.unsplash.com/...",
  duration: "2:15:30",
  instructor: "John Doe",
  isPublic: true,
  featured: true,
  views: 15420,
  likes: 892,
  rating: 4.8,
  tags: ["react", "javascript", "frontend"],
  userId: "sample-user",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. Books Collection
```javascript
{
  title: "The Pragmatic Programmer",
  author: "David Thomas & Andrew Hunt",
  description: "A comprehensive guide to software development...",
  category: "Programming",
  price: 29.99,
  imageUrl: "https://images.unsplash.com/...",
  pdfUrl: "",
  isPublic: true,
  featured: true,
  rating: 4.8,
  pages: 352,
  tags: ["programming", "software development"],
  userId: "sample-user",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Features

### Home Page
- **Categories Section**: Displays popular categories with video and book counts
- **Featured Videos**: Shows public videos with thumbnails, ratings, and view counts
- **Featured Books**: Displays public books with covers, ratings, and page counts
- **Search & Filter**: Real-time search and filtering by category
- **Responsive Design**: Works on desktop and mobile devices

### Video Features
- Video thumbnails with play overlays
- Instructor information
- View counts and ratings
- Category filtering
- Direct video URL support

### Book Features
- Book covers with hover effects
- Author information
- Page counts and ratings
- Category filtering
- Direct links to book details

## Automatic Sample Data
The application automatically populates sample data when no content is found in Firebase:

### Sample Categories
- Programming 💻
- Data Science 📊
- Design 🎨
- Business 💼
- Marketing 📈
- Personal Development 🚀

### Sample Videos
- React Fundamentals
- Machine Learning Basics
- UI/UX Design Principles
- Digital Marketing Strategy
- Productivity Hacks

### Sample Books
- The Pragmatic Programmer
- Clean Code
- Python for Data Analysis
- Don't Make Me Think
- The Lean Startup

## Firebase Security Rules
To enable write access for the population script, you'll need to set up Firebase security rules. Here's a basic example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow write access for authenticated users
    match /{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

## Running the Application

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Access the application**:
   Open http://localhost:3000 in your browser

3. **View the data**:
   - Home page will show categories, videos, and books
   - Navigate to /books for all books
   - Navigate to /videos for all videos
   - Use search and filters to find specific content

## Context Providers
The application uses several React contexts to manage Firebase data:

- `FirebaseVideosProvider`: Manages video data and operations
- `FirebaseCategoriesProvider`: Manages category data and operations
- `BookProvider`: Manages book data and operations (Firebase-based)
- `AuthProvider`: Manages user authentication
- `LanguageProvider`: Manages internationalization

## Real-time Updates
The application uses Firebase's real-time listeners to automatically update the UI when data changes in the database.

## Troubleshooting

### No Data Showing
If no data appears on the home page:
1. Check the browser console for Firebase connection errors
2. Ensure Firebase security rules allow read access
3. The app will automatically add sample data if no content exists

### Permission Errors
If you see permission errors:
1. Set up proper Firebase security rules
2. Ensure your Firebase project is properly configured
3. Check that the API key and project ID are correct

### Video/Book Not Loading
If specific videos or books don't load:
1. Check that the `isPublic` field is set to `true`
2. Verify that the document exists in the correct collection
3. Check the browser console for specific error messages

## Next Steps
1. Set up Firebase Authentication for user management
2. Configure Firebase Storage for file uploads
3. Set up proper security rules for production
4. Add more sample content as needed
5. Implement user-specific features (favorites, history, etc.)
