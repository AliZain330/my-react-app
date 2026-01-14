import React, { useState, useEffect } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import './ForgotPassword.css';
import logo from '../../assets/logo.png';

function ForgotPassword({ onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!auth) {
      setError('Firebase is not configured. Please check your .env file and restart the server.');
      return;
    }
    
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      let errorMessage = 'Failed to send password reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
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
    <div className="forgot-password-modal-overlay" onClick={handleBackdropClick}>
      <div className="forgot-password-modal-container">
        <button className="forgot-password-close-button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="forgot-password-header">
          <img src={logo} alt="YouStamps" className="forgot-password-logo" />
          <h1 className="forgot-password-title">Reset Password</h1>
          <p className="forgot-password-subtitle">
            {success 
              ? 'Check your email for password reset instructions' 
              : 'Enter your email to receive password reset instructions'}
          </p>
        </div>

        {success ? (
          <div className="forgot-password-success">
            <div className="forgot-password-success-message">
              Password reset email has been sent to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions to reset your password.
            </div>
            <button 
              type="button"
              className="forgot-password-button" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            {error && <div className="forgot-password-error">{error}</div>}
            
            <div className="forgot-password-form-group">
              <label htmlFor="email" className="forgot-password-label">Email</label>
              <input
                id="email"
                type="email"
                className="forgot-password-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="forgot-password-button"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="forgot-password-footer">
          <p className="forgot-password-footer-text">
            Remember your password?{' '}
            <button type="button" onClick={onSwitchToLogin} className="forgot-password-link-button">
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
