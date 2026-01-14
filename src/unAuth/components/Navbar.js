import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './Navbar.css';
import logo from '../../assets/logo.png';

function Navbar({ onOpenLogin, onOpenSignup }) {
  const [user, setUser] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setImageError(false); // Reset image error when user changes
      if (currentUser) {
        console.log('User signed in:', {
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          providerId: currentUser.providerData?.[0]?.providerId
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      // For history section, center it; for others, use start
      const blockValue = sectionId === 'history-section' ? 'center' : 'start';
      section.scrollIntoView({ behavior: 'smooth', block: blockValue });
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (onOpenLogin) {
      onOpenLogin();
    }
  };

  const handleSignupClick = (e) => {
    e.preventDefault();
    if (onOpenSignup) {
      onOpenSignup();
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitial = (email) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logo} alt="YouStamps" className="logo-image" />
          <span className="logo-text">YouStamps</span>
        </Link>
        <div className="navbar-center">
          <ul className="navbar-menu">
            <li className="navbar-item" onClick={() => scrollToSection('bumpups-section')}>Features</li>
            <li className="navbar-item" onClick={() => scrollToSection('history-section')}>Examples</li>
            <li className="navbar-item" onClick={() => scrollToSection('footer-section')}>Contact us</li>
          </ul>
        </div>
        <div className="navbar-actions">
          {user ? (
            <button onClick={handleLogout} className="navbar-profile-avatar" title={user.email}>
              {user.photoURL && !imageError ? (
                <img 
                  src={user.photoURL} 
                  alt={user.email} 
                  className="navbar-avatar-image"
                  onError={(e) => {
                    console.error('Failed to load profile image:', user.photoURL);
                    setImageError(true);
                  }}
                />
              ) : (
                <span className="navbar-avatar-initial">{getInitial(user.email)}</span>
              )}
            </button>
          ) : (
            <>
              <button onClick={handleLoginClick} className="navbar-button-login">Log in</button>
              <button onClick={handleSignupClick} className="navbar-button-contact">Sign up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

