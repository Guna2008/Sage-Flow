import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UAParser from 'ua-parser-js';
import { pool } from '../config/db.js';
import { sendVerificationEmail, sendDeviceVerificationEmail } from '../config/email.js';

const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();
  return {
    device: `${result.device.vendor || 'Unknown'} ${result.device.model || 'Device'}`,
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    ip: req.ip || req.connection.remoteAddress
  };
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const result = await pool.query(
      'INSERT INTO users (name, email, password, verification_token) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, email, hashedPassword, verificationToken]
    );

    await sendVerificationEmail(email, verificationToken);

    res.json({ message: 'Signup successful. Check your email to verify your account.', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    if (!user.verified) return res.status(403).json({ error: 'Please verify your email first' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const deviceInfo = getDeviceInfo(req);
    const deviceCheck = await pool.query(
      'SELECT * FROM devices WHERE user_id = $1 AND browser = $2 AND os = $3',
      [user.id, deviceInfo.browser, deviceInfo.os]
    );

    if (deviceCheck.rows.length === 0) {
      const deviceToken = crypto.randomBytes(32).toString('hex');
      await pool.query(
        'INSERT INTO devices (user_id, device_name, browser, os, ip_address, verification_token) VALUES ($1, $2, $3, $4, $5, $6)',
        [user.id, deviceInfo.device, deviceInfo.browser, deviceInfo.os, deviceInfo.ip, deviceToken]
      );
      await sendDeviceVerificationEmail(user.email, deviceInfo, deviceToken);
      return res.status(403).json({ error: 'New device detected. Check your email to verify this device.' });
    }

    if (!deviceCheck.rows[0].verified) {
      return res.status(403).json({ error: 'Device not verified. Check your email.' });
    }

    await pool.query('UPDATE devices SET last_login = NOW() WHERE id = $1', [deviceCheck.rows[0].id]);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const result = await pool.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid token' });

    await pool.query('UPDATE users SET verified = TRUE, verification_token = NULL WHERE verification_token = $1', [token]);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyDevice = async (req, res) => {
  try {
    const { token } = req.query;

    const result = await pool.query('SELECT * FROM devices WHERE verification_token = $1', [token]);
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid token' });

    await pool.query('UPDATE devices SET verified = TRUE, verification_token = NULL WHERE verification_token = $1', [token]);

    res.json({ message: 'Device verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  const user = req.user;
  const deviceInfo = getDeviceInfo(req);
  
  const deviceCheck = await pool.query(
    'SELECT * FROM devices WHERE user_id = $1 AND browser = $2 AND os = $3',
    [user.id, deviceInfo.browser, deviceInfo.os]
  );

  if (deviceCheck.rows.length === 0) {
    const deviceToken = crypto.randomBytes(32).toString('hex');
    await pool.query(
      'INSERT INTO devices (user_id, device_name, browser, os, ip_address, verification_token, verified) VALUES ($1, $2, $3, $4, $5, $6, FALSE)',
      [user.id, deviceInfo.device, deviceInfo.browser, deviceInfo.os, deviceInfo.ip, deviceToken]
    );
    await sendDeviceVerificationEmail(user.email, deviceInfo, deviceToken);
  } else {
    await pool.query('UPDATE devices SET last_login = NOW() WHERE id = $1', [deviceCheck.rows[0].id]);
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
};
