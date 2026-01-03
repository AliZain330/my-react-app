import React from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={logo} alt="YouStamps" className="logo-image" />
          <span className="logo-text">YouStamps</span>
        </div>
        <div className="navbar-center">
          <ul className="navbar-menu">
            <li className="navbar-item">Features</li>
            <li className="navbar-item">Pricing</li>
            <li className="navbar-item">Contact us</li>
          </ul>
        </div>
        <div className="navbar-actions">
          <button className="navbar-button-login">Log in</button>
          <button className="navbar-button-contact">Try it free</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

