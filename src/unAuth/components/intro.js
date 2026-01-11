import React from 'react';
import './intro.css';
import youtubeImage from '../../assets/youtube.png';

function Intro() {
  return (
    <div className="intro">
      <div className="intro-container">
        <div className="intro-content">
          <div className="intro-header">YOUTUBE TIMESTAMPS</div>
          <h1 className="intro-title">
            Turn any YouTube video<br />
            into chapters, notes,<br />
            and answers.
          </h1>
          <p className="intro-description">
            Paste a link and get timestamps, key takeaways, and searchable moments in seconds.
          </p>
          <div className="intro-buttons">
            <button className="intro-button-secondary" onClick={() => {
              const timestampSection = document.getElementById('timestamp-section');
              if (timestampSection) {
                timestampSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}>Get started</button>
          </div>
        </div>
        <div className="intro-visual">
          <div className="intro-image-wrapper">
            <img src={youtubeImage} alt="YouTube video" className="intro-image" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Intro;

