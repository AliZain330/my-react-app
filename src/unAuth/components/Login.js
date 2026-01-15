import React, { useState, useEffect } from 'react';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../firebase';
import './Login.css';
import logo from '../../assets/logo.png';

function Login({ onClose, onSwitchToSignup, onOpenForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    
    if (!auth) {
      setError('Firebase is not configured. Please check your .env file and restart the server.');
      return;
    }
    
    setLoading(true);

    try {
      const existingUser = auth.currentUser;
      if (existingUser && existingUser.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        try {
          await linkWithCredential(existingUser, credential);
        } catch (linkError) {
          if (linkError.code === 'auth/credential-already-in-use' || linkError.code === 'auth/email-already-in-use') {
            await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw linkError;
          }
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Close modal on successful login
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError('Firebase is not configured. Please check your .env file and restart the server.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const existingUser = auth.currentUser;

      if (existingUser && existingUser.isAnonymous) {
        try {
          await linkWithPopup(existingUser, provider);
        } catch (linkError) {
          if (linkError.code === 'auth/credential-already-in-use' || linkError.code === 'auth/account-exists-with-different-credential') {
            await signInWithPopup(auth, provider);
          } else {
            throw linkError;
          }
        }
      } else {
        await signInWithPopup(auth, provider);
      }
      // Close modal on successful login
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
    } catch (err) {
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled.';
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
    <div className="login-modal-overlay" onClick={handleBackdropClick}>
      <div className="login-modal-container">
        <button className="login-close-button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="login-header">
          <img src={logo} alt="YouStamps" className="login-logo" />
          <h1 className="login-title">Log in</h1>
          <p className="login-subtitle">Welcome back to YouStamps</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="login-form-group">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              id="email"
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="login-form-group">
            <div className="login-password-header">
              <label htmlFor="password" className="login-label">Password</label>
              {onOpenForgotPassword && (
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="login-forgot-password"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="password"
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        <div className="login-divider">
          <span className="login-divider-text">or</span>
        </div>

        <button
          type="button"
          className="login-google-button"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="login-google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="login-footer">
          <p className="login-footer-text">
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToSignup} className="login-link-button">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
