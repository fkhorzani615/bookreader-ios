import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const FirebaseDebug = () => {
  const [status, setStatus] = useState('Testing...');
  const [videosCount, setVideosCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        setStatus('Connecting to Firebase...');
        
        // Test connection by trying to get videos
        const videosSnapshot = await getDocs(collection(db, 'videos'));
        const count = videosSnapshot.size;
        
        setVideosCount(count);
        setStatus(`Connected! Found ${count} videos`);
        setError(null);
        
        console.log('Firebase Debug - Success:', {
          videosCount: count,
          videos: videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        });
        
      } catch (err) {
        console.error('Firebase Debug - Error:', err);
        setError(err.message);
        setStatus('Connection failed');
      }
    };

    testFirebase();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: error ? '#fee2e2' : '#d1fae5',
      color: error ? '#991b1b' : '#065f46',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      border: `1px solid ${error ? '#fca5a5' : '#a7f3d0'}`,
      maxWidth: '300px'
    }}>
      <div><strong>Firebase Debug:</strong></div>
      <div>{status}</div>
      {videosCount > 0 && <div>Videos: {videosCount}</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};

export default FirebaseDebug;
