import React from 'react';
import './times.css';

function Times({ timestamps, videoData, onGenerateAnother, onSaveToHistory }) {
  // Parse and filter timestamps to show only from 0:00 to "video tutorial"
  const getFilteredTimestamps = () => {
    if (!timestamps || !timestamps.timestamps_list) {
      return [];
    }

    const timestampList = timestamps.timestamps_list;
    const filtered = [];

    for (const timestamp of timestampList) {
      // Stop when we find "video tutorial" (case insensitive)
      if (timestamp.toLowerCase().includes('video tutorial')) {
        filtered.push(timestamp);
        break;
      }
      filtered.push(timestamp);
    }

    return filtered;
  };

  // Parse timestamp string into time and title
  const parseTimestamp = (timestampString) => {
    const match = timestampString.match(/^(\d+:\d+)\s*-\s*(.+)$/);
    if (match) {
      return {
        time: match[1],
        title: match[2]
      };
    }
    // Fallback if format doesn't match
    return {
      time: timestampString.split(' - ')[0] || timestampString,
      title: timestampString.split(' - ').slice(1).join(' - ') || ''
    };
  };

  // Convert time string (e.g., "0:43") to seconds for YouTube URL
  const timeToSeconds = (timeString) => {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;
      return minutes * 60 + seconds;
    }
    return 0;
  };

  // Create YouTube URL with timestamp
  const getYouTubeUrlWithTimestamp = (timeString) => {
    if (!videoData || !videoData.videoId) {
      return '#';
    }
    const seconds = timeToSeconds(timeString);
    return `https://www.youtube.com/watch?v=${videoData.videoId}&t=${seconds}s`;
  };

  const filteredTimestamps = getFilteredTimestamps();
  const parsedTimestamps = filteredTimestamps.map(parseTimestamp);

  // Split timestamps equally into two columns
  const midPoint = Math.ceil(parsedTimestamps.length / 2);
  const leftColumn = parsedTimestamps.slice(0, midPoint);
  const rightColumn = parsedTimestamps.slice(midPoint);

  const handleCopy = async () => {
    try {
      // Format: "0:00 - Title\n0:43 - Title\n..."
      const copyText = filteredTimestamps.join('\n');
      await navigator.clipboard.writeText(copyText);
      
      // Show feedback (you could add a toast notification here)
      const button = document.querySelector('.times-copy-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = filteredTimestamps.join('\n');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleGenerateAnother = () => {
    // Save to history before clearing
    if (onSaveToHistory) {
      onSaveToHistory({
        timestamps: filteredTimestamps,
        videoData: videoData,
        timestampData: timestamps,
        date: new Date().toISOString()
      });
    }
    
    // Clear and go back to empty state
    if (onGenerateAnother) {
      onGenerateAnother();
    }
  };

  return (
    <div className="times-component">
      <div className="times-box">
        <div className="times-columns">
          <div className="times-column times-column-left">
            {leftColumn.map((timestamp, index) => {
              const youtubeUrl = getYouTubeUrlWithTimestamp(timestamp.time);
              return (
                <div key={index} className="times-item">
                  <span className="times-time">{timestamp.time}</span>
                  {' - '}
                  <a 
                    href={youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="times-title-link"
                  >
                    {timestamp.title}
                  </a>
                </div>
              );
            })}
          </div>
          <div className="times-column times-column-right">
            {rightColumn.map((timestamp, index) => {
              const youtubeUrl = getYouTubeUrlWithTimestamp(timestamp.time);
              return (
                <div key={index} className="times-item">
                  <span className="times-time">{timestamp.time}</span>
                  {' - '}
                  <a 
                    href={youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="times-title-link"
                  >
                    {timestamp.title}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
        <div className="times-actions">
          <button 
            className="times-button times-generate-button" 
            onClick={handleGenerateAnother}
          >
            Generate Another
          </button>
          <button 
            className="times-button times-copy-button" 
            onClick={handleCopy}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

export default Times;

