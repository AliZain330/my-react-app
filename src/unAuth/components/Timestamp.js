import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import './Timestamp.css';

function Timestamp() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timestamps, setTimestamps] = useState(null);
  const [generatingTimestamps, setGeneratingTimestamps] = useState(false);

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

        setVideoData({
          title: snippet.title,
          thumbnail: thumbnail.url,
          videoId: videoId
        });
      } else {
        setError('Video not found');
        setVideoData(null);
      }
    } catch (err) {
      setError('Failed to fetch video information. Please check your API key and try again.');
      setVideoData(null);
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
    // Clear video data and timestamps when URL changes
    if (videoData) {
      setVideoData(null);
    }
    if (timestamps) {
      setTimestamps(null);
    }
  };

  const handleProceed = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      setVideoData(null);
      setTimestamps(null);
      return;
    }

    if (!validateYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      setVideoData(null);
      setTimestamps(null);
      return;
    }

    // Clear previous timestamps
    setTimestamps(null);

    // Extract video ID and fetch video data
    const videoId = extractVideoId(url);
    if (videoId) {
      await fetchVideoData(videoId);
    } else {
      setError('Could not extract video ID from URL');
      setVideoData(null);
      setTimestamps(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleProceed();
    }
  };

  const handleGenerateTimestamps = async () => {
    if (!url.trim() || !videoData) {
      setError('Please enter a valid YouTube URL first');
      return;
    }

    setGeneratingTimestamps(true);
    setError('');

    try {
      const getTimestamps = httpsCallable(functions, 'get_timestamps');
      const result = await getTimestamps({ url: url });
      
      if (result.data && result.data.success) {
        setTimestamps(result.data.data);
      } else {
        setError('Failed to generate timestamps. Please try again.');
      }
    } catch (err) {
      console.error('Error generating timestamps:', err);
      const errorMessage = err.message || 'Failed to generate timestamps. Please try again.';
      setError(errorMessage);
    } finally {
      setGeneratingTimestamps(false);
    }
  };

  // Parse and filter timestamps to show only from 0:00 to "video tutorial"
  const getFilteredTimestamps = () => {
    if (!timestamps || !timestamps.timestamps_list) {
      return [];
    }

    const timestampList = timestamps.timestamps_list;
    const filtered = [];
    let foundVideoTutorial = false;

    for (const timestamp of timestampList) {
      // Stop when we find "video tutorial" (case insensitive)
      if (timestamp.toLowerCase().includes('video tutorial')) {
        filtered.push(timestamp);
        foundVideoTutorial = true;
        break;
      }
      filtered.push(timestamp);
    }

    return filtered;
  };

  // Convert timestamp string to YouTube URL with time parameter
  const createTimestampUrl = (timestampString) => {
    if (!url || !videoData) return url;
    
    // Extract time from timestamp string (e.g., "0:00 - Introduction" -> "0:00")
    const timeMatch = timestampString.match(/^(\d+:\d+)/);
    if (!timeMatch) return url;

    const time = timeMatch[1];
    const [minutes, seconds] = time.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;

    // Add or update the t parameter in the URL
    const videoId = extractVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}&t=${totalSeconds}s`;
    }
    return url;
  };

  return (
    <div className="timestamp">
      <div className="timestamp-container">
        <h2 className="timestamp-heading">Enter your YouTube URL here</h2>
        <div className="timestamp-input-wrapper">
          <input
            id="youtube-url-input"
            name="youtube-url"
            type="text"
            className={`timestamp-input ${error ? 'timestamp-input-error' : ''}`}
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
            autoComplete="url"
          />
          {error && <p className="timestamp-error">{error}</p>}
        </div>
        <button className="timestamp-button" onClick={handleProceed} disabled={loading}>
          {loading ? 'Loading...' : 'Proceed'}
        </button>
        
        {videoData && (
          <div className="timestamp-video-preview">
            <img 
              src={videoData.thumbnail} 
              alt={videoData.title}
              className="timestamp-video-thumbnail"
            />
            <h3 className="timestamp-video-title">{videoData.title}</h3>
            <button 
              className="timestamp-button timestamp-generate-button" 
              onClick={handleGenerateTimestamps} 
              disabled={generatingTimestamps}
            >
              {generatingTimestamps ? 'Generating...' : 'Generate Timestamps'}
            </button>
          </div>
        )}
        
        {timestamps && (
          <div className="timestamp-results">
            <h3 className="timestamp-results-heading">Timestamps</h3>
            <div className="timestamp-list">
              {getFilteredTimestamps().map((timestamp, index) => {
                const timestampUrl = createTimestampUrl(timestamp);
                return (
                  <a
                    key={index}
                    href={timestampUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="timestamp-link"
                  >
                    {timestamp}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timestamp;

