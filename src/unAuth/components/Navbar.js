import React from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';

function Navbar() {
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      // For history section, center it; for others, use start
      const blockValue = sectionId === 'history-section' ? 'center' : 'start';
      section.scrollIntoView({ behavior: 'smooth', block: blockValue });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={logo} alt="YouStamps" className="logo-image" />
          <span className="logo-text">YouStamps</span>
        </div>
        <div className="navbar-center">
          <ul className="navbar-menu">
            <li className="navbar-item" onClick={() => scrollToSection('bumpups-section')}>Features</li>
            <li className="navbar-item" onClick={() => scrollToSection('history-section')}>Examples</li>
            <li className="navbar-item" onClick={() => scrollToSection('footer-section')}>Contact us</li>
          </ul>
        </div>
        <div className="navbar-actions">
          <button className="navbar-button-login">Log in</button>
          <button className="navbar-button-contact">Sign up</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

