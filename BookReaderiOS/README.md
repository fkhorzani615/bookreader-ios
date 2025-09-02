# BookReader iOS App

A comprehensive iOS application built with SwiftUI and Firebase, providing a digital library experience for books and videos.

## Features

### 🔐 Authentication
- User registration and login with Firebase Auth
- Secure password management
- User profile management
- Password reset functionality

### 📚 Book Management
- Browse and search books by category
- Book details with ratings and reviews
- PDF viewer integration
- Reading progress tracking
- Favorites and watch history

### 🎥 Video Streaming
- Video library with categories
- Video player with controls
- Thumbnail generation
- View count and ratings
- Duration and quality settings

### 🔍 Search & Discovery
- Global search across books and videos
- Category-based filtering
- Advanced sorting options
- Recent search history
- Smart recommendations

### 👤 User Profiles
- Personal dashboard with statistics
- Reading and viewing history
- Favorites management
- Profile customization
- Subscription management

### ⚙️ Settings & Preferences
- App preferences
- Notification settings
- Language selection
- Data usage controls
- Dark mode support

## Technical Stack

- **Frontend**: SwiftUI
- **Backend**: Firebase
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Platform**: iOS 17.0+
- **Architecture**: MVVM with ObservableObject

## Project Structure

```
BookReaderiOS/
├── BookReaderiOS/
│   ├── Models/
│   │   ├── Book.swift
│   │   ├── Video.swift
│   │   ├── Category.swift
│   │   └── User.swift
│   ├── ViewModels/
│   │   ├── AuthViewModel.swift
│   │   ├── BookViewModel.swift
│   │   ├── VideoViewModel.swift
│   │   └── CategoryViewModel.swift
│   ├── Views/
│   │   ├── HomeView.swift
│   │   ├── BooksView.swift
│   │   ├── VideosView.swift
│   │   ├── SearchView.swift
│   │   ├── ProfileView.swift
│   │   └── Components/
│   │       ├── BookCard.swift
│   │       └── VideoCard.swift
│   ├── BookReaderiOSApp.swift
│   └── ContentView.swift
├── GoogleService-Info.plist
├── Package.swift
└── README.md
```

## Setup Instructions

### Prerequisites
- Xcode 15.0 or later
- iOS 17.0+ deployment target
- Firebase project setup
- Apple Developer Account (for device testing)

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing project
3. Add iOS app to your Firebase project
4. Download `GoogleService-Info.plist`
5. Place it in the project root directory

### 2. Firebase Configuration

1. Enable Authentication in Firebase Console
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication

2. Enable Firestore Database
   - Go to Firestore Database
   - Create database in test mode
   - Set up security rules

3. Enable Storage
   - Go to Storage
   - Set up storage rules

### 3. Xcode Project Setup

1. Open `BookReaderiOS.xcodeproj` in Xcode
2. Add Firebase SDK dependencies:
   - File > Add Package Dependencies
   - Add: `https://github.com/firebase/firebase-ios-sdk.git`
   - Select: FirebaseAuth, FirebaseFirestore, FirebaseStorage

3. Configure Bundle Identifier
   - Select project in navigator
   - Update Bundle Identifier to match Firebase config

4. Build and Run
   - Select target device or simulator
   - Press Cmd+R to build and run

### 4. Database Schema Setup

The app will automatically create the following collections in Firestore:

#### Users Collection
```json
{
  "uid": "user_id",
  "email": "user@example.com",
  "displayName": "User Name",
  "phone": "",
  "location": "",
  "bio": "",
  "createdAt": "timestamp",
  "subscription": {
    "plan": "free",
    "status": "active",
    "expiresAt": null
  },
  "watchHistory": [],
  "favorites": [],
  "preferences": {
    "language": "en",
    "quality": "auto",
    "autoplay": true
  }
}
```

#### Books Collection
```json
{
  "title": "Book Title",
  "description": "Book description",
  "author": "Author Name",
  "category": "Programming",
  "coverImageUrl": "https://...",
  "pdfUrl": "https://...",
  "isPublic": true,
  "featured": false,
  "views": 0,
  "likes": 0,
  "tags": ["tag1", "tag2"],
  "userId": "user_id",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "language": "en",
  "pages": 300,
  "rating": 0.0,
  "reviews": 0
}
```

#### Videos Collection
```json
{
  "title": "Video Title",
  "description": "Video description",
  "category": "Programming",
  "videoUrl": "https://...",
  "thumbnailUrl": "https://...",
  "duration": "15:30",
  "isPublic": true,
  "featured": false,
  "views": 0,
  "likes": 0,
  "tags": ["tag1", "tag2"],
  "userId": "user_id",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "language": "en",
  "rating": 0.0,
  "reviews": 0
}
```

#### Categories Collection
```json
{
  "name": "Programming",
  "description": "Programming and software development",
  "icon": "laptopcomputer",
  "color": "#FF6B6B",
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Usage

### Authentication
1. Launch the app
2. Create a new account or sign in
3. Complete profile setup

### Browsing Content
1. Use the Home tab to discover featured content
2. Browse books and videos by category
3. Use search to find specific content
4. Filter and sort results

### Reading Books
1. Select a book from the library
2. View book details and ratings
3. Open PDF for reading
4. Track reading progress

### Watching Videos
1. Select a video from the library
2. Use video player controls
3. Adjust quality settings
4. View video information

### Profile Management
1. Access profile from the Profile tab
2. Edit personal information
3. Manage preferences
4. View statistics and history

## Customization

### Adding New Categories
1. Update `CategoryViewModel.swift`
2. Add new categories to `getDefaultCategories()`
3. Update UI components as needed

### Modifying Data Models
1. Update model files in `Models/` directory
2. Ensure Firestore compatibility
3. Update corresponding ViewModels

### UI Customization
1. Modify SwiftUI views in `Views/` directory
2. Update colors and styling
3. Customize navigation and layouts

## Testing

### Simulator Testing
- Use iOS Simulator for basic functionality testing
- Test different device sizes and orientations
- Verify UI responsiveness

### Device Testing
- Test on physical iOS devices
- Verify Firebase connectivity
- Test authentication flows

### Firebase Testing
- Use Firebase Console to monitor data
- Test security rules
- Verify real-time updates

## Troubleshooting

### Common Issues

1. **Firebase Connection Failed**
   - Verify `GoogleService-Info.plist` is in project
   - Check Firebase project configuration
   - Verify network connectivity

2. **Build Errors**
   - Clean build folder (Cmd+Shift+K)
   - Update Firebase SDK versions
   - Check iOS deployment target

3. **Authentication Issues**
   - Verify Firebase Auth is enabled
   - Check email/password requirements
   - Verify user creation in Firebase Console

### Debug Mode
- Enable Firebase debug logging
- Use Xcode console for debugging
- Monitor Firestore queries

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes and test
4. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check Firebase documentation
- Review SwiftUI documentation

## Roadmap

- [ ] Offline reading support
- [ ] Social features (comments, sharing)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Apple Watch companion app
- [ ] iPad optimization
- [ ] Accessibility improvements

---

Built with ❤️ using SwiftUI and Firebase
