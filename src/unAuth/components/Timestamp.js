import React, { useState } from 'react';
import './Timestamp.css';

function Timestamp() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  // YouTube URL validation regex
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})(\S*)?$/;

  const validateYouTubeUrl = (urlString) => {
    if (!urlString.trim()) {
      return false;
    }
    return youtubeRegex.test(urlString);
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    if (error && inputUrl.trim()) {
      setError('');
    }
  };

  const handleProceed = () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    // If validation passes, proceed with the URL
    setError('');
    console.log('Valid YouTube URL:', url);
    // Add your proceed logic here
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleProceed();
    }
  };

  return (
    <div className="timestamp">
      <div className="timestamp-container">
        <h2 className="timestamp-heading">Enter your YouTube URL here</h2>
        <div className="timestamp-input-wrapper">
          <input
            type="text"
            className={`timestamp-input ${error ? 'timestamp-input-error' : ''}`}
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
          />
          {error && <p className="timestamp-error">{error}</p>}
        </div>
        <button className="timestamp-button" onClick={handleProceed}>
          Proceed
        </button>
      </div>
    </div>
  );
}

export default Timestamp;

