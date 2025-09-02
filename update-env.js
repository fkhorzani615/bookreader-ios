const fs = require('fs');
const path = require('path');

console.log('🔧 Firebase Configuration Updater\n');
const envPath = path.join(process.cwd(), '.env');

const envTemplate = `# Firebase Configuration
# Replace these values with your actual Firebase project credentials
# Get these from your Firebase Console: https://console.firebase.google.com/

REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id-here

# Stripe Configuration (for web payments)
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# RevenueCat Configuration (for mobile payments)
REACT_APP_REVENUECAT_API_KEY=your-revenuecat-api-key
`;
try {
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Creating one...');
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env file created!');
  } else {
    console.log('✅ .env file found.');
    console.log('\nIf you need to update your Firebase credentials, open the .env file and replace the placeholder values with your actual credentials.');
  }
} catch (err) {
  console.error('❌ Error handling .env file:', err);
}


console.log('\n📋 To fix the Firebase configuration error:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Select your project');
console.log('3. Click the gear icon (⚙️) for Project Settings');
console.log('4. Scroll down to "Your apps" section');
console.log('5. Click "Add app" → "Web" if you don\'t have a web app');
console.log('6. Copy the configuration values');
console.log('7. Update your .env file with the real values');

console.log('\n🔧 Example of what you need to update in .env:');
console.log('REACT_APP_FIREBASE_API_KEY=AIzaSyC... (you have this)');
console.log('REACT_APP_FIREBASE_AUTH_DOMAIN=your-actual-project.firebaseapp.com');
console.log('REACT_APP_FIREBASE_PROJECT_ID=your-actual-project-id');
console.log('REACT_APP_FIREBASE_STORAGE_BUCKET=your-actual-project.appspot.com');
console.log('REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id');
console.log('REACT_APP_FIREBASE_APP_ID=your-actual-app-id');

console.log('\n⚠️  After updating .env, restart your development server:');
console.log('   npm start');

console.log('\n✅ Ready to update!'); 