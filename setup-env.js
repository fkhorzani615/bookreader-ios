const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Firebase Environment Configuration...\n');

// Check if .env file already exists
const envPath = path.join(process.cwd(), '.env');
const firebaseConfigPath = path.join(process.cwd(), 'firebase-config.env');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('📝 Current .env file content:');
  console.log('─'.repeat(50));
  console.log(fs.readFileSync(envPath, 'utf8'));
  console.log('─'.repeat(50));
} else {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Firebase Configuration
# Replace these values with your actual Firebase project credentials
# Get these from your Firebase Console: https://console.firebase.google.com/

REACT_APP_FIREBASE_API_KEY="AIzaSyDxql4hc82vl-G_IMZEnzheo9G7QEhcKeQ"
REACT_APP_FIREBASE_AUTH_DOMAIN="bookreader-54669.firebaseapp.com"
REACT_APP_FIREBASE_PROJECT_ID="bookreader-54669"
REACT_APP_FIREBASE_STORAGE_BUCKET="bookreader-54669.firebasestorage.app"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="63194010598"
REACT_APP_FIREBASE_APP_ID="1:63194010598:web:9eece40255c07d4d807c27"

# Stripe Configuration (for web payments)
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# RevenueCat Configuration (for mobile payments)
REACT_APP_REVENUECAT_API_KEY=your-revenuecat-api-key
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
}

// Check firebase-config.env
if (fs.existsSync(firebaseConfigPath)) {
  const firebaseConfigContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  if (firebaseConfigContent.trim()) {
    console.log('\n📝 Found firebase-config.env with content:');
    console.log('─'.repeat(50));
    console.log(firebaseConfigContent);
    console.log('─'.repeat(50));
    console.log('\n⚠️  Note: React will use the .env file, not firebase-config.env');
    console.log('   You can copy the values from firebase-config.env to .env if needed');
  } else {
    console.log('\n📝 firebase-config.env exists but is empty');
  }
}

console.log('\n📋 Next Steps:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project or select an existing one');
console.log('3. Click "Add app" and select "Web"');
console.log('4. Register your app and copy the configuration');
console.log('5. Update the .env file with your actual Firebase credentials');
console.log('6. Restart your development server: npm start');

console.log('\n🔧 Example Firebase configuration from console:');
console.log('const firebaseConfig = {');
console.log('  apiKey: "AIzaSyC...",');
console.log('  authDomain: "your-project.firebaseapp.com",');
console.log('  projectId: "your-project",');
console.log('  storageBucket: "your-project.appspot.com",');
console.log('  messagingSenderId: "123456789",');
console.log('  appId: "1:123456789:web:abc123"');
console.log('};');

console.log('\n📝 Update your .env file with these values:');
console.log('REACT_APP_FIREBASE_API_KEY=AIzaSyC...');
console.log('REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com');
console.log('REACT_APP_FIREBASE_PROJECT_ID=your-project');
console.log('REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com');
console.log('REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789');
console.log('REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123');

console.log('\n✅ Setup complete!'); 