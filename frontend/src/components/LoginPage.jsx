import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLogin from './GoogleLogin';
import config from '../config';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ On mount: handle existing token or Google OAuth callback
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const user = urlParams.get('user');
    const error = urlParams.get('error');
    const errorMessage = urlParams.get('message');

    if (oauthToken && user) {
      try {
        const decodedUser = decodeURIComponent(user);
        const parsedUser = JSON.parse(decodedUser);

        localStorage.setItem('token', oauthToken);
        localStorage.setItem('user', JSON.stringify(parsedUser));

        navigate('/home');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Error processing OAuth data:', err);
        setError(`Error processing login data: ${err.message}. Please try again.`);
      }
    } else if (error) {
      const displayError = errorMessage
        ? `${error}: ${errorMessage}`
        : error === 'google_auth_failed'
        ? 'Google login failed. Please try again.'
        : error;
      setError(displayError);
    }
  }, [navigate]);

  // ✅ Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loginUser = async (url) => {
      try {
        const response = await fetch(`${url}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        return await response.json();
      } catch (err) {
        throw err;
      }
    };

    try {
      let data;
      try {
        data = await loginUser(config.backendUrl);
      } catch (primaryError) {
        console.error('Primary login failed, trying fallback:', primaryError);
        if (!config.backendUrl.includes('localhost')) {
          try {
            data = await loginUser('http://localhost:5000');
          } catch (fallbackError) {
            console.error('Fallback login also failed:', fallbackError);
            throw new Error(primaryError.message || 'Login failed. Please try again later.');
          }
        } else {
          throw primaryError;
        }
      }

      // ✅ Safely handle and store login data
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      if (data?.user && typeof data.user === 'object') {
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        console.warn('⚠️ No valid user data received, storing empty object.');
        localStorage.setItem('user', JSON.stringify({}));
      }

      navigate('/home');
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Sign in to your account</h2>

        {error && (
          <div className="login-error">
            {error === 'google_auth_failed' ? 'Google login failed. Please try again.' : error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="label">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="input"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">
          <div className="divider-line"></div>
          <span className="divider-text">OR</span>
          <div className="divider-line"></div>
        </div>

        <div className="oauth-container">
          <GoogleLogin />
        </div>

        <p className="signup-text">
          Don't have an account?{' '}
          <Link to="/signup" className="signup-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
