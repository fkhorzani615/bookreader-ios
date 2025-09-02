import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { useFirebaseVideos } from '../context/FirebaseVideosContext';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  Heart,
  Share2,
  Download,
  Clock,
  Users,
  Star,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { id } = useParams();
  const { getVideo, videos } = useFirebaseVideos();
  const [video, setVideo] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoData = await getVideo(id);
        if (videoData) {
          setVideo(videoData);
          
          // Get related videos (same category, different videos)
          const related = videos
            .filter(v => v.id !== id && v.category === videoData.category && v.isPublic)
            .slice(0, 3);
          setRelatedVideos(related);
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchVideo();
    }
  }, [id, getVideo, videos]);

  const handleProgress = (state) => {
    setProgress(state.played);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  if (loading) {
    return (
      <div className="video-player-page">
        <div className="loading-state">
          <Play size={48} className="loading-icon" />
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="video-player-page">
        <div className="error-state">
          <p>Video not found</p>
        </div>
      </div>
    );
  }

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    setMuted(value === 0);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };



  return (
    <div className="video-player-page">
      <div className="video-container">
        <div className="video-wrapper">
          <div className="video-player">
            <ReactPlayer
              url={video.url}
              playing={playing}
              volume={muted ? 0 : volume}
              onProgress={handleProgress}
              onDuration={handleDuration}
              width="100%"
              height="100%"
              controls={false}
              onMouseMove={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            />
            
            {/* Custom Controls */}
            <div className={`video-controls ${showControls ? 'show' : ''}`}>
              <div className="progress-bar">
                <div 
                  className="progress-filled"
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
              
              <div className="controls-main">
                <div className="controls-left">
                  <button 
                    className="control-btn"
                    onClick={() => setPlaying(!playing)}
                  >
                    {playing ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  
                  <div className="volume-control">
                    <button 
                      className="control-btn"
                      onClick={toggleMute}
                    >
                      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={muted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="volume-slider"
                    />
                  </div>
                  
                  <div className="time-display">
                    {formatTime(progress * duration)} / {formatTime(duration)}
                  </div>
                </div>
                
                <div className="controls-right">
                  <button className="control-btn">
                    <Settings size={20} />
                  </button>
                  <button className="control-btn">
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="video-info-section">
          <div className="video-header">
            <h1>{video.title}</h1>
            <div className="video-stats">
              <span className="views">
                <Users size={16} />
                {video.views} views
              </span>
              <span className="rating">
                <Star size={16} />
                {video.rating}
              </span>
              <span className="upload-date">
                <Clock size={16} />
                {new Date(video.uploadedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="video-actions">
            <button 
              className={`action-btn ${isLiked ? 'liked' : ''}`}
              onClick={toggleLike}
            >
              <Heart size={20} />
              <span>{isLiked ? video.likes + 1 : video.likes}</span>
            </button>
            <button className="action-btn">
              <Share2 size={20} />
              <span>Share</span>
            </button>
            <button className="action-btn">
              <Download size={20} />
              <span>Download</span>
            </button>
          </div>
          
          <div className="video-description">
            <h3>Description</h3>
            <p>{video.description}</p>
            <div className="video-tags">
              {video.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="sidebar">
        <h3>Related Videos</h3>
        <div className="related-videos">
          {relatedVideos.map((relatedVideo) => (
            <motion.div
              key={relatedVideo.id}
              className="related-video-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="related-thumbnail">
                <img src={relatedVideo.thumbnail} alt={relatedVideo.title} />
                <div className="related-duration">{relatedVideo.duration}</div>
              </div>
              <div className="related-info">
                <h4>{relatedVideo.title}</h4>
                <p>{relatedVideo.instructor}</p>
                <div className="related-stats">
                  <span>{relatedVideo.views} views</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 