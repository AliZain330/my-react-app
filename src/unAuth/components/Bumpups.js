import React from 'react';
import './Bumpups.css';
import image1 from '../../assets/bumpup1.png';
import image2 from '../../assets/bumpup2.png';
import image3 from '../../assets/bumpup3.png';

function Bumpups() {
  return (
    <section className="bumpups" id="bumpups-section">
      <div className="bumpups-container">
        <h2 className="bumpups-heading">Do more with bumups.com</h2>
        <p className="bumpups-description">
          Process your videos to deliver insights across all industries. Ask questions, request summaries, analyses and more with Bump-1.0
        </p>
        <div className="bumpups-grid">
          <a href="https://bumpups.com/" target="_blank" rel="noopener noreferrer" className="bumpup-item">
            <img src={image1} alt="Bumpup 1" className="bumpup-image" />
          </a>
          <a href="https://bumpups.com/" target="_blank" rel="noopener noreferrer" className="bumpup-item">
            <img src={image2} alt="Bumpup 2" className="bumpup-image" />
          </a>
          <a href="https://bumpups.com/" target="_blank" rel="noopener noreferrer" className="bumpup-item">
            <img src={image3} alt="Bumpup 3" className="bumpup-image" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Bumpups;

