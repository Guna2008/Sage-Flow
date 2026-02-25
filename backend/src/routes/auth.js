import express from 'express';
import passport from '../config/passport.js';
import { signup, login, verifyEmail, verifyDevice, googleAuth } from '../controllers/authController.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.get('/verify-device', verifyDevice);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuth);
}

export default router;
