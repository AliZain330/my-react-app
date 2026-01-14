import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';
import './Signup.css';
import logo from '../../assets/logo.png';

function Signup({ onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Close on Escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!auth) {
      setError('Firebase is not configured. Please check your .env file and restart the server.');
      return;
    }
    
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send email verification
      try {
        await sendEmailVerification(user);
        // Show success message (you can customize this)
        console.log('Verification email sent to', email);
      } catch (verificationError) {
        console.error('Error sending verification email:', verificationError);
        // Don't block signup if verification email fails
      }
      
      // Close modal on successful signup
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      let errorMessage = 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please log in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!auth) {
      setError('Firebase is not configured. Please check your .env file and restart the server.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Close modal on successful signup
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      let errorMessage = 'Failed to sign up with Google. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign up was cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="signup-modal-overlay" onClick={handleBackdropClick}>
      <div className="signup-modal-container">
        <button className="signup-close-button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="signup-header">
          <img src={logo} alt="YouStamps" className="signup-logo" />
          <h1 className="signup-title">Sign up</h1>
          <p className="signup-subtitle">Create your YouStamps account</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="signup-error">{error}</div>}
          
          <div className="signup-form-group">
            <label htmlFor="email" className="signup-label">Email</label>
            <input
              id="email"
              type="email"
              className="signup-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="signup-form-group">
            <label htmlFor="password" className="signup-label">Password</label>
            <input
              id="password"
              type="password"
              className="signup-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 6 characters)"
              required
              disabled={loading}
            />
          </div>

          <div className="signup-form-group">
            <label htmlFor="confirmPassword" className="signup-label">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="signup-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="signup-button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="signup-divider">
          <span className="signup-divider-text">or</span>
        </div>

        <button
          type="button"
          className="signup-google-button"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <svg className="signup-google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="signup-footer">
          <p className="signup-footer-text">
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} className="signup-link-button">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
