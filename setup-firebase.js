#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Firebase Setup for StreamFlow 🔥\n');

const questions = [
  {
    name: 'apiKey',
    message: 'Enter your Firebase API Key:',
    required: true
  },
  {
    name: 'authDomain',
    message: 'Enter your Firebase Auth Domain (e.g., your-project.firebaseapp.com):',
    required: true
  },
  {
    name: 'projectId',
    message: 'Enter your Firebase Project ID:',
    required: true
  },
  {
    name: 'storageBucket',
    message: 'Enter your Firebase Storage Bucket (e.g., your-project.appspot.com):',
    required: true
  },
  {
    name: 'messagingSenderId',
    message: 'Enter your Firebase Messaging Sender ID:',
    required: true
  },
  {
    name: 'appId',
    message: 'Enter your Firebase App ID:',
    required: true
  }
];

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.message, (answer) => {
      if (question.required && !answer.trim()) {
        console.log('❌ This field is required. Please try again.\n');
        resolve(askQuestion(question));
      } else {
        resolve(answer.trim());
      }
    });
  });
}

async function setupFirebase() {
  try {
    console.log('Please provide your Firebase configuration details.\n');
    console.log('You can find these in your Firebase Console > Project Settings > General > Your apps\n');

    const answers = {};
    
    for (const question of questions) {
      answers[question.name] = await askQuestion(question);
    }

    // Create .env file content
    const envContent = `# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=${answers.apiKey}
REACT_APP_FIREBASE_AUTH_DOMAIN=${answers.authDomain}
REACT_APP_FIREBASE_PROJECT_ID=${answers.projectId}
REACT_APP_FIREBASE_STORAGE_BUCKET=${answers.storageBucket}
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${answers.messagingSenderId}
REACT_APP_FIREBASE_APP_ID=${answers.appId}

# Stripe Configuration (for payments)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Other Configuration
REACT_APP_APP_NAME=StreamFlow
REACT_APP_APP_VERSION=1.0.0
`;

    // Write .env file
    const envPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Firebase configuration saved to .env file!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure you have enabled Authentication in Firebase Console');
    console.log('2. Set up Firestore Database in Firebase Console');
    console.log('3. Configure Storage in Firebase Console');
    console.log('4. Set up security rules for Firestore and Storage');
    console.log('5. Restart your development server: npm start');
    console.log('\n📖 For detailed setup instructions, see FIREBASE_SETUP.md');

  } catch (error) {
    console.error('❌ Error setting up Firebase:', error.message);
  } finally {
    rl.close();
  }
}

// Check if .env already exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  rl.question('A .env file already exists. Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      setupFirebase();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  setupFirebase();
} 