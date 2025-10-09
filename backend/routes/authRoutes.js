// routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { registerUser, authUser } from '../controllers/authController.js';

const router = express.Router();

// ------------------- Local Authentication ------------------- //
router.post('/register', registerUser);
router.post('/login', authUser);

// ------------------- Google OAuth ------------------- //
// Step 1: Redirect user to Google for authentication
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2: Handle callback from Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL, session: false }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token valid for 7 days
      );

      // Encode user info to send to frontend
      const user = encodeURIComponent(JSON.stringify(req.user));

      // Frontend URL
      const frontendUrl = process.env.CLIENT_URL || 'https://herbal-garden-frontend.onrender.com';

      // Redirect to frontend login page with token & user info
      res.redirect(`${frontendUrl}/login?token=${token}&user=${user}`);
    } catch (err) {
      console.error('Error generating token for Google OAuth:', err);
      // Redirect with error if something fails
      const frontendUrl = process.env.CLIENT_URL || 'https://herbal-garden-frontend.onrender.com';
      res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
  }
);

// ------------------- Logout ------------------- //
router.post('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    if (req.session) {
      req.session.destroy(() => {
        res.clearCookie('connect.sid', { path: '/' });
        return res.json({ success: true, message: 'Logged out' });
      });
    } else {
      res.clearCookie('connect.sid', { path: '/' });
      return res.json({ success: true, message: 'Logged out' });
    }
  });
});

export default router;
