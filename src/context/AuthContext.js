import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [firebaseError, setFirebaseError] = useState(null);

  // Check if Firebase is properly configured
  const isFirebaseConfigured = auth && db;

  const signup = async (email, password, displayName, additionalData = {}) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your configuration.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        phone: additionalData.phone || '',
        location: additionalData.location || '',
        bio: additionalData.bio || '',
        createdAt: new Date(),
        subscription: {
          plan: 'free',
          status: 'active',
          expiresAt: null
        },
        watchHistory: [],
        favorites: [],
        preferences: {
          language: 'en',
          quality: 'auto',
          autoplay: true
        }
      });

      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      setFirebaseError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your configuration.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      setFirebaseError(error.message);
      throw error;
    }
  };

  const logout = () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your configuration.');
    }
    return signOut(auth);
  };

  const resetPassword = (email) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your configuration.');
    }
    return sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (updates) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not properly configured. Please check your configuration.');
    }

    try {
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true });
        setUserProfile(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setFirebaseError(error.message);
      throw error;
    }
  };

  const fetchUserProfile = async (uid) => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase not configured, cannot fetch user profile');
      return null;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setFirebaseError(error.message);
      return null;
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase not configured, skipping auth state listener');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [isFirebaseConfigured]);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    loading,
    firebaseError,
    isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 