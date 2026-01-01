import React from 'react';
import './Footer.css';
import logo from '../../assets/logo.png';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-left">
            <div className="footer-logo">
              <img src={logo} alt="YouStamps" className="footer-logo-image" />
              <span className="footer-logo-text">YouStamps</span>
            </div>
            <p className="footer-tagline">#1 AI VIDEO MODEL</p>
            <p className="footer-description">
              YouStamps will watch any video and deliver insights across all industries.
            </p>
            <div className="footer-social">
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="X (Twitter)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-nav">
            <div className="footer-nav-column">
              <h3 className="footer-nav-heading">Product</h3>
              <ul className="footer-nav-list">
                <li><a href="#" className="footer-nav-link">News</a></li>
                <li><a href="#" className="footer-nav-link">Pricing</a></li>
                <li>
                  <a href="#" className="footer-nav-link">
                    Product Changelog
                    <span className="footer-nav-arrow">→</span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-nav-column">
              <h3 className="footer-nav-heading">Features</h3>
              <ul className="footer-nav-list">
                <li><a href="#" className="footer-nav-link">Workspaces</a></li>
                <li><a href="#" className="footer-nav-link">Creator Studio</a></li>
                <li><a href="#" className="footer-nav-link">YouTube Videos</a></li>
                <li><a href="#" className="footer-nav-link">Local Videos</a></li>
              </ul>
            </div>
            <div className="footer-nav-column">
              <h3 className="footer-nav-heading">API</h3>
              <ul className="footer-nav-list">
                <li><a href="#" className="footer-nav-link">Startups</a></li>
                <li><a href="#" className="footer-nav-link">Zapier</a></li>
                <li><a href="#" className="footer-nav-link">Enterprise</a></li>
                <li>
                  <a href="#" className="footer-nav-link">
                    API Documentation
                    <span className="footer-nav-arrow">→</span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-nav-column">
              <h3 className="footer-nav-heading">Resources</h3>
              <ul className="footer-nav-list">
                <li>
                  <a href="#" className="footer-nav-link">
                    Feature Request
                    <span className="footer-nav-arrow">→</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-nav-link">
                    Help Center
                    <span className="footer-nav-arrow">→</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="footer-copyright">
            ©2025 YouStamps Inc. - All rights reserved. <a href="#" className="footer-legal-link">Terms of Service</a> <a href="#" className="footer-legal-link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

