const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Firebase Hosting deployment with HTTPS...');

// Step 1: Check if Firebase CLI is installed
console.log('\n🔍 Checking Firebase CLI installation...');
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.log('❌ Firebase CLI not found. Installing...');
  try {
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    console.log('✅ Firebase CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Firebase CLI:', installError.message);
    process.exit(1);
  }
}

// Step 2: Build the application
console.log('\n📦 Building the React application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Check if user is logged in to Firebase
console.log('\n🔐 Checking Firebase authentication...');
try {
  execSync('firebase projects:list', { stdio: 'pipe' });
  console.log('✅ Already logged in to Firebase');
} catch (error) {
  console.log('🔑 Please log in to Firebase...');
  try {
    execSync('firebase login', { stdio: 'inherit' });
    console.log('✅ Firebase login successful');
  } catch (loginError) {
    console.error('❌ Firebase login failed:', loginError.message);
    process.exit(1);
  }
}

// Step 4: Deploy to Firebase Hosting
console.log('\n🌐 Deploying to Firebase Hosting...');
try {
  execSync('firebase deploy --only hosting', { stdio: 'inherit' });
  console.log('✅ Deployment completed successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

// Step 5: Display HTTPS URLs
console.log('\n🎉 Deployment Summary:');
console.log('=====================================');
console.log('✅ Your app is now live with HTTPS!');
console.log('🌐 Firebase Hosting URL: https://bookreader-54669.web.app');
console.log('🔒 HTTPS is automatically enabled');
console.log('🔄 HTTP to HTTPS redirects are active');
console.log('📱 Your app works on all devices');
console.log('=====================================');

console.log('\n📋 Next Steps:');
console.log('1. Visit https://bookreader-54669.web.app to see your app');
console.log('2. To add a custom domain:');
console.log('   - Go to Firebase Console > Hosting');
console.log('   - Click "Add custom domain"');
console.log('   - Follow the verification steps');
console.log('   - HTTPS will be automatically provisioned');

console.log('\n🔄 To update your app in the future:');
console.log('1. Make your changes');
console.log('2. Run: npm run build');
console.log('3. Run: firebase deploy --only hosting');
