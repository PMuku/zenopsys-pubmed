import React, { useState } from 'react';
import { Loader2, LogIn } from 'lucide-react';

const AuthScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        let errMessage = 'Login failed';
        try {
          const errData = await response.json();
          if (errData.message) errMessage = errData.message;
        } catch (_) {
          errMessage += ` (HTTP ${response.status})`;
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      
      if (data.user) {
        onLogin(data.user);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">PubMed AI</h1>
          <p className="auth-subtitle">Sign in to start your session</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="email" className="auth-label">Email Address</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@example.com"
              disabled={isLoading}
              required
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-button" disabled={isLoading || !email.trim()}>
            {isLoading ? <Loader2 size={20} className="spinner" /> : (
              <>
                <LogIn size={18} />
                <span>Continue</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
