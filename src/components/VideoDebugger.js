import React, { useState, useEffect } from 'react';
import { useFirebaseVideos } from '../context/FirebaseVideosContext';
import { checkVideosExist, populateSampleVideos, getVideoStats, debugFirebaseConnection } from '../utils/videoUtils';
import { Play, Database, AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import './VideoDebugger.css';

const VideoDebugger = () => {
  const { videos, loading, error } = useFirebaseVideos();
  const [debugInfo, setDebugInfo] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    runDebugCheck();
  }, []);

  const runDebugCheck = async () => {
    setIsChecking(true);
    try {
      const connectionResult = await debugFirebaseConnection();
      const videosResult = await checkVideosExist();
      const videoStats = await getVideoStats();
      
      setDebugInfo({
        connection: connectionResult,
        videos: videosResult,
        context: {
          videosCount: videos.length,
          loading,
          error
        }
      });
      setStats(videoStats);
    } catch (error) {
      console.error('Debug check failed:', error);
      setDebugInfo({
        error: error.message
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handlePopulateVideos = async () => {
    setIsPopulating(true);
    try {
      const result = await populateSampleVideos();
      alert(`Successfully created ${result.created} sample videos!`);
      // Refresh debug info
      setTimeout(() => {
        runDebugCheck();
      }, 2000);
    } catch (error) {
      alert(`Error populating videos: ${error.message}`);
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div className="video-debugger">
      <div className="debug-header">
        <h2>Video Debugger</h2>
        <p>Debug and troubleshoot video loading issues</p>
      </div>

      <div className="debug-controls">
        <button 
          onClick={runDebugCheck} 
          disabled={isChecking}
          className="debug-button"
        >
          {isChecking ? <Loader size={16} className="spinning" /> : <RefreshCw size={16} />}
          Refresh Debug Info
        </button>
        
        <button 
          onClick={handlePopulateVideos} 
          disabled={isPopulating}
          className="populate-button"
        >
          {isPopulating ? <Loader size={16} className="spinning" /> : <Database size={16} />}
          Populate Sample Videos
        </button>
      </div>

      {debugInfo && (
        <div className="debug-sections">
          {/* Firebase Connection */}
          <div className="debug-section">
            <h3>Firebase Connection</h3>
            {debugInfo.connection ? (
              <div className={`status-card ${debugInfo.connection.success ? 'success' : 'error'}`}>
                {debugInfo.connection.success ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <div className="status-content">
                  <div className="status-title">
                    {debugInfo.connection.success ? 'Connected' : 'Connection Failed'}
                  </div>
                  <div className="status-message">{debugInfo.connection.message}</div>
                  {debugInfo.connection.videosCount !== undefined && (
                    <div className="status-detail">
                      Videos in collection: {debugInfo.connection.videosCount}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="status-card error">
                <AlertCircle size={20} />
                <div className="status-content">
                  <div className="status-title">Connection Test Failed</div>
                  <div className="status-message">{debugInfo.error}</div>
                </div>
              </div>
            )}
          </div>

          {/* Videos Collection */}
          <div className="debug-section">
            <h3>Videos Collection</h3>
            {debugInfo.videos ? (
              <div className={`status-card ${debugInfo.videos.exists ? 'success' : 'warning'}`}>
                <Database size={20} />
                <div className="status-content">
                  <div className="status-title">
                    {debugInfo.videos.exists ? 'Videos Found' : 'No Videos Found'}
                  </div>
                  <div className="status-message">
                    {debugInfo.videos.count} videos in collection
                  </div>
                  {debugInfo.videos.videos.length > 0 && (
                    <div className="videos-list">
                      <h4>Available Videos:</h4>
                      {debugInfo.videos.videos.slice(0, 5).map(video => (
                        <div key={video.id} className="video-item">
                          <Play size={12} />
                          <span>{video.title || 'Untitled'}</span>
                          <span className="video-category">({video.category || 'No category'})</span>
                        </div>
                      ))}
                      {debugInfo.videos.videos.length > 5 && (
                        <div className="more-videos">
                          ... and {debugInfo.videos.videos.length - 5} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="status-card error">
                <AlertCircle size={20} />
                <div className="status-content">
                  <div className="status-title">Failed to Check Videos</div>
                  <div className="status-message">{debugInfo.error}</div>
                </div>
              </div>
            )}
          </div>

          {/* Context State */}
          <div className="debug-section">
            <h3>React Context State</h3>
            <div className={`status-card ${debugInfo.context ? 'info' : 'error'}`}>
              <Database size={20} />
              <div className="status-content">
                <div className="status-title">Context Information</div>
                <div className="status-details">
                  <div>Videos in context: {debugInfo.context?.videosCount || 0}</div>
                  <div>Loading state: {debugInfo.context?.loading ? 'Yes' : 'No'}</div>
                  <div>Error: {debugInfo.context?.error || 'None'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="debug-section">
              <h3>Video Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-label">Total Videos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats.public}</div>
                  <div className="stat-label">Public Videos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats.featured}</div>
                  <div className="stat-label">Featured Videos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats.categories.length}</div>
                  <div className="stat-label">Categories</div>
                </div>
              </div>
              {stats.categories.length > 0 && (
                <div className="categories-list">
                  <h4>Categories:</h4>
                  <div className="categories-tags">
                    {stats.categories.map(category => (
                      <span key={category} className="category-tag">{category}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="debug-recommendations">
        <h3>Troubleshooting Recommendations</h3>
        <div className="recommendations-list">
          {debugInfo?.videos?.exists === false && (
            <div className="recommendation">
              <AlertCircle size={16} />
              <span>No videos found in Firebase. Click "Populate Sample Videos" to add test data.</span>
            </div>
          )}
          
          {debugInfo?.connection?.success === false && (
            <div className="recommendation">
              <AlertCircle size={16} />
              <span>Firebase connection failed. Check your Firebase configuration and security rules.</span>
            </div>
          )}
          
          {debugInfo?.context?.videosCount === 0 && debugInfo?.videos?.exists === true && (
            <div className="recommendation">
              <AlertCircle size={16} />
              <span>Videos exist in Firebase but not in React context. Check the real-time listener.</span>
            </div>
          )}
          
          {debugInfo?.context?.error && (
            <div className="recommendation">
              <AlertCircle size={16} />
              <span>Context error: {debugInfo.context.error}</span>
            </div>
          )}
          
          {debugInfo?.videos?.exists === true && debugInfo?.context?.videosCount > 0 && (
            <div className="recommendation success">
              <CheckCircle size={16} />
              <span>Everything looks good! Videos should be displaying correctly.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDebugger;


