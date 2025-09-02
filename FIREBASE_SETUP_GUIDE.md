# 🔥 Firebase Setup Guide

## Current Issue
You're getting the error: **"Firebase is not properly configured. Please check your configuration."**

This happens because your `.env` file has placeholder values instead of real Firebase credentials.

## ✅ Quick Fix Steps

### 1. Get Your Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon (⚙️) next to "Project Overview"
4. Scroll down to "Your apps" section
5. If you don't see a web app, click "Add app" → "Web"
6. Register your app and copy the configuration

### 2. Update Your .env File
Open your `.env` file in the project root and replace the placeholder values:

```env
# Current (placeholder values)
REACT_APP_FIREBASE_API_KEY=AIzaSyDxql4hc82vl-G_IMZEnzheo9G7QEhcKeQ
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id

# Replace with your actual values from Firebase Console
REACT_APP_FIREBASE_API_KEY=AIzaSyDxql4hc82vl-G_IMZEnzheo9G7QEhcKeQ
REACT_APP_FIREBASE_AUTH_DOMAIN=your-actual-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-actual-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-actual-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
REACT_APP_FIREBASE_APP_ID=your-actual-app-id
```

### 3. Restart Your Development Server
```bash
npm start
# or
yarn start
```

## 🔧 Example Firebase Configuration
From your Firebase Console, you'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Convert this to your `.env` file:
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyC...
REACT_APP_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=my-project
REACT_APP_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 🚨 Important Notes
- **Don't commit your `.env` file** to version control (it should be in `.gitignore`)
- **Restart the development server** after updating `.env`
- **Keep your API keys secure** - never share them publicly

## ✅ Verification
After updating, you should see:
- No more "Firebase is not properly configured" errors
- Successful user registration and login
- Firebase services working properly

## 🆘 Still Having Issues?
1. Check the browser console for specific error messages
2. Verify all environment variables are set correctly
3. Make sure you restarted the development server
4. Check that your Firebase project has Authentication enabled 