import express from 'express';
import passport from '../config/passport.js';
import { signup, login, verifyEmail, verifyDevice, googleAuth } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.get('/verify-device', verifyDevice);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuth);

export default router;
