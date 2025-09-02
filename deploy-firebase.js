const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Firebase deployment preparation...');

// Step 1: Build the application
console.log('\n📦 Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Create deployment directory
const deployDir = path.join(__dirname, 'deploy-firebase');
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// Step 3: Copy build files to deployment directory
console.log('\n📁 Copying build files to deployment directory...');
try {
  execSync(`xcopy "build\\*" "${deployDir}\\" /E /I /Y`, { stdio: 'inherit' });
  console.log('✅ Build files copied successfully!');
} catch (error) {
  console.error('❌ Failed to copy build files:', error.message);
  process.exit(1);
}

// Step 4: Create Firebase configuration file for production
console.log('\n🔥 Creating Firebase configuration for production...');
const firebaseConfigContent = `
// Firebase configuration for production
window.firebaseConfig = {
  apiKey: "AIzaSyDxql4hc82vl-G_IMZEnzheo9G7QEhcKeQ",
  authDomain: "bookreader-54669.firebaseapp.com",
  projectId: "bookreader-54669",
  storageBucket: "bookreader-54669.firebasestorage.app",
  messagingSenderId: "63194010598",
  appId: "1:63194010598:web:9eece40255c07d4d807c27",
  measurementId: "G-CB53QKSR8F"
};

// Initialize Firebase for production
if (typeof window !== 'undefined') {
  // Load Firebase SDK
  const script1 = document.createElement('script');
  script1.src = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.src = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
  document.head.appendChild(script2);

  const script3 = document.createElement('script');
  script3.src = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
  document.head.appendChild(script3);

  const script4 = document.createElement('script');
  script4.src = 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';
  document.head.appendChild(script4);

  // Initialize Firebase when SDK is loaded
  script4.onload = function() {
    if (window.firebase) {
      window.firebase.initializeApp(window.firebaseConfig);
      console.log('Firebase initialized for production');
    }
  };
}
`;

fs.writeFileSync(path.join(deployDir, 'firebase-config.js'), firebaseConfigContent);

// Step 5: Update index.html to include Firebase configuration
console.log('\n📄 Updating index.html with Firebase configuration...');
const indexPath = path.join(deployDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Add Firebase configuration before closing head tag
  const firebaseScript = '<script src="firebase-config.js"></script>';
  indexContent = indexContent.replace('</head>', `${firebaseScript}\n</head>`);
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ index.html updated with Firebase configuration!');
}

// Step 6: Create deployment instructions
console.log('\n📋 Creating deployment instructions...');
const deploymentInstructions = `# Firebase BookReader Deployment

## Deployment Files
This directory contains the built application ready for deployment to your remote server.

## Files Included
- ✅ Built React application (static files)
- ✅ Firebase configuration for production
- ✅ Updated index.html with Firebase integration

## Firebase Configuration
The application is configured to use Firebase with the following settings:
- Project ID: bookreader-54669
- API Key: AIzaSyDxql4hc82vl-G_IMZEnzheo9G7QEhcKeQ
- Auth Domain: bookreader-54669.firebaseapp.com
- Storage Bucket: bookreader-54669.firebasestorage.app

## Deployment Steps

### 1. Upload to Remote Server
Upload all files in this directory to your web server's public directory.

### 2. Server Configuration
Ensure your server is configured to serve static files and handle client-side routing:

#### Apache (.htaccess)
\`\`\`apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
\`\`\`

#### Nginx
\`\`\`nginx
location / {
  try_files $uri $uri/ /index.html;
}
\`\`\`

### 3. Firebase Security Rules
Make sure your Firebase Firestore has the following security rules:

\`\`\`javascript
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
\`\`\`

### 4. Verify Deployment
After deployment, visit your website and check:
- ✅ Home page loads with categories, videos, and books
- ✅ Firebase data is displayed correctly
- ✅ Search and filtering works
- ✅ Navigation between pages works

## Sample Data
The application will automatically display sample data if no content exists in Firebase:
- 6 categories (Programming, Data Science, Design, Business, Marketing, Personal Development)
- 5 videos (React Fundamentals, Machine Learning Basics, UI/UX Design, Digital Marketing, Productivity Hacks)
- 5 books (The Pragmatic Programmer, Clean Code, Python for Data Analysis, Don't Make Me Think, The Lean Startup)

## Troubleshooting
1. Check browser console for Firebase connection errors
2. Verify Firebase security rules allow read access
3. Ensure all files are uploaded to the server
4. Check server configuration for client-side routing

## Support
If you encounter issues, check the browser console for error messages and ensure Firebase is properly configured.
`;

fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT_README.md'), deploymentInstructions);

// Step 7: Create a simple server script for testing
console.log('\n🌐 Creating test server script...');
const serverScript = `const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`🚀 Firebase BookReader server running on port \${PORT}\`);
  console.log(\`📱 Open http://localhost:\${PORT} to view the application\`);
  console.log(\`🔥 Firebase data will be loaded automatically\`);
});
`;

fs.writeFileSync(path.join(deployDir, 'server.js'), serverScript);

// Step 8: Create package.json for the deployment
const packageJson = {
  "name": "bookreader-firebase-deployment",
  "version": "1.0.0",
  "description": "BookReader application with Firebase integration",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
};

fs.writeFileSync(path.join(deployDir, 'package.json'), JSON.stringify(packageJson, null, 2));

console.log('\n🎉 Deployment preparation completed!');
console.log('\n📁 Deployment directory created: deploy-firebase/');
console.log('\n📋 Next steps:');
console.log('1. Upload the contents of deploy-firebase/ to your remote server');
console.log('2. Configure your server for static file serving');
console.log('3. Set up Firebase security rules if needed');
console.log('4. Test the application on your server');
console.log('\n🔥 Firebase data will be automatically loaded when users visit the site!');
