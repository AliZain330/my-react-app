import React from 'react';
import './Timestamp.css';

function Timestamp() {
  const currentDate = new Date().toLocaleString();

  return (
    <div className="timestamp">
      <div className="timestamp-container">
        <p className="timestamp-label">Current Time:</p>
        <p className="timestamp-value">{currentDate}</p>
      </div>
    </div>
  );
}

export default Timestamp;

