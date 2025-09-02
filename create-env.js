const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Environment Setup 🔥');
console.log('=====================================');
console.log('');
console.log('This script will help you create a .env file with your Firebase configuration.');
console.log('');
console.log('To get your Firebase credentials:');
console.log('1. Go to https://console.firebase.google.com/');
console.log('2. Create a new project or select your existing project');
console.log('3. Click the gear icon ⚙️ next to "Project Overview"');
console.log('4. Select "Project settings"');
console.log('5. Scroll down to "Your apps" section');
console.log('6. Click the web icon (</>) to add a web app');
console.log('7. Register your app and copy the configuration');
console.log('');

const envContent = `# Firebase Configuration
# Replace these values with your actual Firebase project credentials
# Get these from: https://console.firebase.google.com/ > Project Settings > General > Your apps

REACT_APP_FIREBASE_API_KEY=your-actual-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Stripe Configuration (for web payments)
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# RevenueCat Configuration (for mobile payments)
REACT_APP_REVENUECAT_API_KEY=your-revenuecat-api-key
`;

const envPath = path.join(__dirname, '.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('Please update it manually with your Firebase credentials.');
    console.log('');
    console.log('Required environment variables:');
    console.log('- REACT_APP_FIREBASE_API_KEY');
    console.log('- REACT_APP_FIREBASE_AUTH_DOMAIN');
    console.log('- REACT_APP_FIREBASE_PROJECT_ID');
    console.log('- REACT_APP_FIREBASE_STORAGE_BUCKET');
    console.log('- REACT_APP_FIREBASE_MESSAGING_SENDER_ID');
    console.log('- REACT_APP_FIREBASE_APP_ID');
    console.log('');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Open the .env file in your project root');
    console.log('2. Replace the placeholder values with your actual Firebase credentials');
    console.log('3. Save the file');
    console.log('4. Restart your development server (npm start)');
    console.log('');
    console.log('🔧 Example of what your .env should look like:');
    console.log('REACT_APP_FIREBASE_API_KEY=AIzaSyC...');
    console.log('REACT_APP_FIREBASE_AUTH_DOMAIN=myapp-12345.firebaseapp.com');
    console.log('REACT_APP_FIREBASE_PROJECT_ID=myapp-12345');
    console.log('REACT_APP_FIREBASE_STORAGE_BUCKET=myapp-12345.appspot.com');
    console.log('REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789');
    console.log('REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456');
    console.log('');
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('');
  console.log('Please create the .env file manually with the following content:');
  console.log('');
  console.log(envContent);
}

console.log('📚 For more help, check out the FIREBASE_SETUP.md file in your project.'); 