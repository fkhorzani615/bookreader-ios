# 🚀 iOS BookReader App Setup Guide

## 📱 Project Overview
This is a native iOS application built with **SwiftUI** and **Firebase**, replicating the functionality of the original React-based book reader project.

## 🛠️ Prerequisites
- **Xcode 15.0+** (for local development)
- **iOS 17.0+** target
- **Firebase project** (already configured)
- **GitHub account** (for Codespaces)

## 🚀 Quick Start with GitHub Codespaces

### Option 1: GitHub Codespaces (Recommended for Cloud Development)
1. **Go to**: [https://github.com/fkhorzani615/bookreader-ios](https://github.com/fkhorzani615/bookreader-ios)
2. **Click the green "Code" button**
3. **Select "Codespaces" tab**
4. **Click "Create codespace on main"**
5. **Wait for the environment to build** (takes 2-3 minutes)

### Option 2: Local Xcode Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/fkhorzani615/bookreader-ios.git
   cd bookreader-ios/BookReaderiOS
   ```
2. **Open in Xcode**: `BookReaderiOS.xcodeproj`

## 🔥 Firebase Configuration
Your Firebase project is already configured:
- **Project ID**: `bookreader-54669`
- **iOS App ID**: `1:63194010598:ios:d790f09dfbed0e88807c27`
- **API Key**: `AIzaSyCe0PH7vY9xetPNnitawJQBpCnN45HqhZQ`

## 📁 Project Structure
```
BookReaderiOS/
├── BookReaderiOSApp.swift          # Main app entry point
├── ContentView.swift               # Root view with authentication
├── Models/                         # Data models
│   ├── Book.swift
│   ├── Video.swift
│   ├── Category.swift
│   └── User.swift
├── ViewModels/                     # MVVM ViewModels
│   ├── AuthViewModel.swift
│   ├── BookViewModel.swift
│   ├── VideoViewModel.swift
│   └── CategoryViewModel.swift
├── Views/                          # SwiftUI views
│   ├── HomeView.swift
│   ├── BooksView.swift
│   ├── VideosView.swift
│   ├── SearchView.swift
│   ├── ProfileView.swift
│   ├── BookDetailView.swift
│   ├── VideoPlayerView.swift
│   └── Components/
│       ├── BookCard.swift
│       └── VideoCard.swift
├── Package.swift                   # Swift Package Manager
└── GoogleService-Info.plist       # Firebase configuration
```

## 🏗️ Architecture
- **MVVM Pattern**: Model-View-ViewModel architecture
- **SwiftUI**: Modern declarative UI framework
- **Firebase**: Backend services (Auth, Firestore, Storage)
- **ObservableObject**: SwiftUI's reactive state management
- **Async/Await**: Modern Swift concurrency

## 🔐 Features
- **Authentication**: Sign up, login, password reset
- **Book Management**: Browse, search, read books
- **Video Streaming**: Watch videos with custom player
- **User Profiles**: Manage account and preferences
- **Search**: Global search across all content
- **Categories**: Organize content by type

## 🧪 Testing
1. **Build the project**: `Cmd + B`
2. **Run in Simulator**: `Cmd + R`
3. **Test Firebase connection**: Check console for errors
4. **Test Authentication**: Try sign up/login

## 🚨 Troubleshooting

### Common Issues:
1. **Firebase Connection Error**:
   - Verify `GoogleService-Info.plist` is in the project
   - Check bundle ID matches Firebase configuration

2. **Build Errors**:
   - Clean build folder: `Cmd + Shift + K`
   - Reset package cache: `File → Packages → Reset Package Caches`

3. **Simulator Issues**:
   - Reset simulator: `Device → Erase All Content and Settings`

## 📚 Next Steps
1. **Test the app** in iOS Simulator
2. **Customize UI** and branding
3. **Add more features** as needed
4. **Deploy to TestFlight** for beta testing

## 🆘 Support
- **GitHub Issues**: [Create an issue](https://github.com/fkhorzani615/bookreader-ios/issues)
- **Firebase Console**: [Manage your project](https://console.firebase.google.com/project/bookreader-54669)

---
**Happy Coding! 🎉**
