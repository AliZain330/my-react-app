import React, { useState } from 'react';
import './LandingPage.css';
import Navbar from './components/Navbar';
import Intro from './components/intro';
import Bumpups from './components/Bumpups';
import Timestamp from './components/Timestamp';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';

function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleOpenSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const handleCloseSignup = () => {
    setShowSignup(false);
  };

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
    setShowForgotPassword(false);
  };

  const handleOpenForgotPassword = () => {
    setShowForgotPassword(true);
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
  };

  return (
    <div className="landing-page">
      <Navbar onOpenLogin={handleOpenLogin} onOpenSignup={handleOpenSignup} />
      <div className="landing-content">
        <Intro />
        <Timestamp onOpenLogin={handleOpenLogin} onOpenSignup={handleOpenSignup} />
        <Bumpups />
      </div>
      <Footer />
      {showLogin && (
        <Login 
          onClose={handleCloseLogin} 
          onSwitchToSignup={handleSwitchToSignup}
          onOpenForgotPassword={handleOpenForgotPassword}
        />
      )}
      {showSignup && (
        <Signup 
          onClose={handleCloseSignup} 
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
      {showForgotPassword && (
        <ForgotPassword 
          onClose={handleCloseForgotPassword} 
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </div>
  );
}

export default LandingPage;
