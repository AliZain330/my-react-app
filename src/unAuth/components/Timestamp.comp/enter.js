import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import './enter.css';

// Add all solid icons to the library
library.add(fas);

function Enter({ onVideoDataChange, onGenerateTimestamps, generatingTimestamps, showOnlyPreview = false, videoData: externalVideoData = null }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use external videoData if provided (from history), otherwise use internal state
  const displayVideoData = externalVideoData || videoData;

  // YouTube URL validation regex
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})(\S*)?$/;

  const validateYouTubeUrl = (urlString) => {
    if (!urlString.trim()) {
      return false;
    }
    return youtubeRegex.test(urlString);
  };

  const extractVideoId = (urlString) => {
    const match = urlString.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const fetchVideoData = async (videoId) => {
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
    if (!apiKey) {
      setError('YouTube API key is not configured. Please check your .env file.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`
      );

      const data = await response.json();

      // Check for API errors in the response
      if (data.error) {
        const errorMessage = data.error.message || 'Failed to fetch video data';
        if (data.error.errors && data.error.errors.length > 0) {
          const firstError = data.error.errors[0];
          if (firstError.reason === 'keyInvalid') {
            setError('Invalid API key. Please check your REACT_APP_YOUTUBE_API_KEY in .env file.');
          } else if (firstError.reason === 'quotaExceeded') {
            setError('YouTube API quota exceeded. Please try again later.');
          } else {
            setError(errorMessage);
          }
        } else {
          setError(errorMessage);
        }
        setVideoData(null);
        setLoading(false);
        if (onVideoDataChange) onVideoDataChange(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        const snippet = video.snippet;
        
        // Get max resolution thumbnail, fallback to high if maxresdefault doesn't exist
        const thumbnail = snippet.thumbnails.maxres || 
                         snippet.thumbnails.high || 
                         snippet.thumbnails.medium ||
                         snippet.thumbnails.default;

        const newVideoData = {
          title: snippet.title,
          thumbnail: thumbnail.url,
          videoId: videoId
        };
        
        setVideoData(newVideoData);
        if (onVideoDataChange) onVideoDataChange(newVideoData);
      } else {
        setError('Video not found');
        setVideoData(null);
        if (onVideoDataChange) onVideoDataChange(null);
      }
    } catch (err) {
      setError('Failed to fetch video information. Please check your API key and try again.');
      setVideoData(null);
      if (onVideoDataChange) onVideoDataChange(null);
      console.error('Error fetching video data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    if (error && inputUrl.trim()) {
      setError('');
    }
    // Clear video data when URL changes
    if (videoData) {
      setVideoData(null);
      if (onVideoDataChange) onVideoDataChange(null);
    }
  };

  const handleProceed = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      setVideoData(null);
      if (onVideoDataChange) onVideoDataChange(null);
      return;
    }

    if (!validateYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      setVideoData(null);
      if (onVideoDataChange) onVideoDataChange(null);
      return;
    }

    // Extract video ID and fetch video data
    const videoId = extractVideoId(url);
    if (videoId) {
      await fetchVideoData(videoId);
    } else {
      setError('Could not extract video ID from URL');
      setVideoData(null);
      if (onVideoDataChange) onVideoDataChange(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleProceed();
    }
  };

  const handleGenerateTimestamps = () => {
    if (onGenerateTimestamps) {
      onGenerateTimestamps(url);
    }
  };

  return (
    <div className="enter-component">
      {!showOnlyPreview && (
        <>
          <h2 className="enter-heading">Enter your YouTube URL here</h2>
          <div className="enter-input-wrapper">
        <div className="enter-input-container">
          <input
            id="youtube-url-input"
            name="youtube-url"
            type="text"
            className={`enter-input ${error ? 'enter-input-error' : ''}`}
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
            autoComplete="url"
          />
          <div className="enter-button-container">
            {!displayVideoData ? (
              <button 
                className="enter-button" 
                onClick={handleProceed} 
                disabled={loading}
              >
                <FontAwesomeIcon icon={['fas', 'key']} className="enter-button-icon" />
                {loading ? 'Loading...' : 'Proceed'}
              </button>
            ) : (
              <button 
                className="enter-button" 
                onClick={handleGenerateTimestamps} 
                disabled={generatingTimestamps}
              >
                <FontAwesomeIcon 
                  icon={['fas', 'hammer']} 
                  className={`enter-button-icon ${generatingTimestamps ? 'hammer-animating' : ''}`}
                />
                {generatingTimestamps ? 'Generating...' : 'Generate Timestamps'}
              </button>
            )}
          </div>
        </div>
        {error && <p className="enter-error">{error}</p>}
      </div>
      </>
      )}
      
      {/* Placeholder preview - shows when no videoData and not loading */}
      {!displayVideoData && !loading && (
        <div className="enter-video-preview enter-video-preview-placeholder">
          <div className="enter-placeholder-thumbnail">
            <svg width="80" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="enter-placeholder-youtube-icon">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
            </svg>
          </div>
          <div className="enter-placeholder-title"></div>
        </div>
      )}

      {/* Loading state - shows when loading */}
      {loading && (
        <div className="enter-video-preview enter-video-preview-loading">
          <div className="enter-placeholder-thumbnail">
            <div className="enter-loading-spinner"></div>
          </div>
          <div className="enter-placeholder-title"></div>
        </div>
      )}

      {/* Actual video preview - shows when videoData is loaded */}
      {displayVideoData && !loading && (
        <div className="enter-video-preview">
          <img 
            src={displayVideoData.thumbnail} 
            alt={displayVideoData.title}
            className="enter-video-thumbnail"
          />
          <h3 className="enter-video-title">{displayVideoData.title}</h3>
        </div>
      )}
    </div>
  );
}

export default Enter;

