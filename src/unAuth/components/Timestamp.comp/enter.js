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
  const normalizeErrorMessage = (message) => {
    if (!message) return '';
    if (message.toLowerCase().includes('api key not valid')) {
      return 'Failed to fetch video preview. Please try again.';
    }
    return message;
  };

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

  const fetchOEmbedData = async (videoUrl, videoId) => {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`
    );

    if (!response.ok) {
      throw new Error(`oEmbed request failed: ${response.status}`);
    }

    const data = await response.json();
    const newVideoData = {
      title: data.title,
      thumbnail: data.thumbnail_url,
      videoId: videoId
    };

    setVideoData(newVideoData);
    if (onVideoDataChange) onVideoDataChange(newVideoData);
  };

  const fetchNoEmbedData = async (videoUrl, videoId) => {
    const response = await fetch(
      `https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`
    );

    if (!response.ok) {
      throw new Error(`noembed request failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.title || !data.thumbnail_url) {
      throw new Error('noembed response missing title or thumbnail');
    }

    const newVideoData = {
      title: data.title,
      thumbnail: data.thumbnail_url,
      videoId: videoId
    };

    setVideoData(newVideoData);
    if (onVideoDataChange) onVideoDataChange(newVideoData);
  };

  const fetchVideoData = async (videoId, videoUrl) => {
    setLoading(true);
    setError('');

    try {
      try {
        // Prefer noembed first (reliable CORS on hosted sites)
        await fetchNoEmbedData(videoUrl, videoId);
        return;
      } catch (noEmbedError) {
        console.warn('noembed failed, trying YouTube oEmbed:', noEmbedError);
      }

      try {
        // YouTube oEmbed as secondary fallback
        await fetchOEmbedData(videoUrl, videoId);
        return;
      } catch (oEmbedError) {
        console.warn('YouTube oEmbed failed:', oEmbedError);
      }

      if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_YOUTUBE_API_KEY) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}&part=snippet`
          );
          const data = await response.json();

          if (!response.ok || data.error) {
            throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
          }

          if (data.items && data.items.length > 0) {
            const video = data.items[0];
            const snippet = video.snippet;
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
            return;
          }
        } catch (dataApiError) {
          console.warn('YouTube Data API failed in development:', dataApiError);
        }
      }

      setError('Failed to fetch video information. Please try again.');
      setVideoData(null);
      if (onVideoDataChange) onVideoDataChange(null);
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
      await fetchVideoData(videoId, url);
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
        {error && <p className="enter-error">{normalizeErrorMessage(error)}</p>}
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

