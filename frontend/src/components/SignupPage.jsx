import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLogin from './GoogleLogin';
import config from '../config';

import '../styles/SignupPage.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Google OAuth callback (without storing anything in localStorage)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const user = urlParams.get('user');
    const error = urlParams.get('error');
    const errorMessage = urlParams.get('message');

    if (oauthToken && user) {
      try {
        const userData = typeof user === 'string'
          ? JSON.parse(decodeURIComponent(user))
          : user;

        // Optionally: pass user to a global state or context instead of localStorage
        console.log('OAuth login success:', { token: oauthToken, user: userData });

        navigate('/home');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('OAuth parsing error:', err);
        setError('Error processing login data. Please try again.');
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

  const registerUser = async (userData) => {
    const response = await fetch(`${config.backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const userData = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName
    };

    try {
      await registerUser(userData);

      // Redirect after successful signup
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h2 className="signup-title">Create an account</h2>

        {error && <div className="signup-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="col">
              <label htmlFor="firstName" className="label">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="input"
              />
            </div>
            <div className="col">
              <label htmlFor="lastName" className="label">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
              className="input"
            />
          </div>

          <div className="form-group mb-20">
            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
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

        <p className="signin-text">
          Already have an account?{' '}
          <Link to="/login" className="signin-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
