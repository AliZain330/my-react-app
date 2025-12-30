import React from 'react';
import './LandingPage.css';
import Navbar from './components/Navbar';
import Bumpups from './components/Bumpups';
import Timestamp from './components/Timestamp';
import Footer from './components/Footer';

function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />
      <div className="landing-content">
        <h1 className="landing-title">Hello what's up guys</h1>
        <Timestamp />
        <Bumpups />
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;

