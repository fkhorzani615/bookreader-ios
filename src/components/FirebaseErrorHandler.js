import React from 'react';
import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './FirebaseErrorHandler.css';

const FirebaseErrorHandler = () => {
  const { firebaseError, isFirebaseConfigured } = useAuth();

  if (isFirebaseConfigured && !firebaseError) {
    return null;
  }

  return (
    <div className="firebase-error-container">
      <div className="firebase-error-card">
        <div className="firebase-error-header">
          <AlertTriangle className="firebase-error-icon" />
          <h2>Firebase Configuration Issue</h2>
        </div>
        
        {!isFirebaseConfigured ? (
          <div className="firebase-error-content">
            <p>
              Firebase is not properly configured. This app requires Firebase to function correctly.
            </p>
            <div className="firebase-error-steps">
              <h3>To fix this issue:</h3>
              <ol>
                <li>Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase Console <ExternalLink size={16} /></a></li>
                <li>Add a web app to your Firebase project</li>
                <li>Copy the Firebase configuration</li>
                <li>Create a <code>.env</code> file in your project root</li>
                <li>Add your Firebase credentials to the <code>.env</code> file</li>
                <li>Restart your development server</li>
              </ol>
            </div>
            <div className="firebase-error-actions">
              <a 
                href="https://console.firebase.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="firebase-error-button primary"
              >
                <Settings size={16} />
                Go to Firebase Console
              </a>
              <a 
                href="/FIREBASE_SETUP.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="firebase-error-button secondary"
              >
                View Setup Guide
              </a>
            </div>
          </div>
        ) : (
          <div className="firebase-error-content">
            <p>
              An error occurred with Firebase: <strong>{firebaseError}</strong>
            </p>
            <div className="firebase-error-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="firebase-error-button primary"
              >
                Retry
              </button>
              <a 
                href="https://firebase.google.com/support" 
                target="_blank" 
                rel="noopener noreferrer"
                className="firebase-error-button secondary"
              >
                Get Help
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseErrorHandler; 