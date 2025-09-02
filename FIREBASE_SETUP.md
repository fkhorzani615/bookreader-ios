# Firebase Setup Guide

This guide will help you set up Firebase for your StreamFlow application and resolve common Firebase errors.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "streamflow-app")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Add Your App to Firebase

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter your app nickname (e.g., "StreamFlow Web")
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your-actual-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## Step 4: Enable Authentication

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## Step 6: Set Up Storage

1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode" (for development)
4. Select a location for your storage
5. Click "Done"

## Step 7: Set Up Security Rules

### Firestore Security Rules
Go to Firestore Database > Rules and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public content can be read by anyone
    match /videos/{videoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /books/{bookId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Security Rules
Go to Storage > Rules and update with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public content
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Common Firebase Errors and Solutions

### 1. "Firebase is not properly configured"
**Cause**: Missing or invalid Firebase configuration
**Solution**: 
- Check your `.env` file has all required Firebase variables
- Ensure you're using the correct Firebase project credentials
- Restart your development server after updating environment variables

### 2. "Permission denied" errors
**Cause**: Firestore/Storage security rules blocking access
**Solution**:
- Update security rules to allow appropriate access
- Check if user is authenticated when required
- Verify user permissions match the rules

### 3. "Network error" or "Connection failed"
**Cause**: Network connectivity issues or Firebase project issues
**Solution**:
- Check your internet connection
- Verify Firebase project is active and not suspended
- Check Firebase Console for any service disruptions

### 4. "Invalid API key" error
**Cause**: Incorrect or expired API key
**Solution**:
- Regenerate API key in Firebase Console
- Update your `.env` file with the new key
- Restart your development server

### 5. "Quota exceeded" errors
**Cause**: Firebase usage limits reached
**Solution**:
- Check Firebase Console for usage statistics
- Upgrade to a paid plan if needed
- Implement usage optimization

## Testing Your Setup

1. Start your development server: `npm start`
2. Try to register a new user
3. Check the browser console for any Firebase errors
4. Verify user data appears in Firestore Database
5. Test file uploads to Storage

## Production Deployment

For production deployment:

1. Update security rules to be more restrictive
2. Set up proper authentication methods
3. Configure custom domains if needed
4. Set up monitoring and analytics
5. Review and optimize your Firebase usage

## Troubleshooting

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase services are enabled in your project
4. Check Firebase Console for any project issues
5. Review Firebase documentation for specific error codes

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support) 