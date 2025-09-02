import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDxql4hc82vl-G_IMZEnzheo9G7QEhcKeQ",
  authDomain: "bookreader-54669.firebaseapp.com",
  projectId: "bookreader-54669",
  storageBucket: "bookreader-54669.firebasestorage.app",
  messagingSenderId: "63194010598",
  appId: "1:63194010598:web:9eece40255c07d4d807c27",
  measurementId: "G-CB53QKSR8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log('Firebase initialized successfully');
console.log('Storage bucket:', firebaseConfig.storageBucket);
console.log('Project ID:', firebaseConfig.projectId);

export { auth, db, storage };
export default app; 