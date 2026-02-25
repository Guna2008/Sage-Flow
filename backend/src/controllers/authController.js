import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UAParser from 'ua-parser-js';
import { db } from '../config/db.js';
import { sendVerificationEmail, sendDeviceVerificationEmail } from '../config/emailMock.js';

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
    
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const result = db.prepare(
      'INSERT INTO users (name, email, password, verification_token, verified) VALUES (?, ?, ?, ?, 1)'
    ).run(name, email, hashedPassword, verificationToken);

    await sendVerificationEmail(email, verificationToken);

    res.json({ message: 'Signup successful. Check console for verification link.', user: { id: result.lastInsertRowid, name, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const deviceInfo = getDeviceInfo(req);
    const deviceCheck = db.prepare(
      'SELECT * FROM devices WHERE user_id = ? AND browser = ? AND os = ?'
    ).get(user.id, deviceInfo.browser, deviceInfo.os);

    if (!deviceCheck) {
      const deviceToken = crypto.randomBytes(32).toString('hex');
      db.prepare(
        'INSERT INTO devices (user_id, device_name, browser, os, ip_address, verification_token, verified) VALUES (?, ?, ?, ?, ?, ?, 1)'
      ).run(user.id, deviceInfo.device, deviceInfo.browser, deviceInfo.os, deviceInfo.ip, deviceToken);
      await sendDeviceVerificationEmail(user.email, deviceInfo, deviceToken);
    } else {
      db.prepare('UPDATE devices SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(deviceCheck.id);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = db.prepare('SELECT * FROM users WHERE verification_token = ?').get(token);
    if (!user) return res.status(400).json({ error: 'Invalid token' });

    db.prepare('UPDATE users SET verified = 1, verification_token = NULL WHERE verification_token = ?').run(token);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyDevice = async (req, res) => {
  try {
    const { token } = req.query;

    const device = db.prepare('SELECT * FROM devices WHERE verification_token = ?').get(token);
    if (!device) return res.status(400).json({ error: 'Invalid token' });

    db.prepare('UPDATE devices SET verified = 1, verification_token = NULL WHERE verification_token = ?').run(token);

    res.json({ message: 'Device verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  const user = req.user;
  const deviceInfo = getDeviceInfo(req);
  
  const deviceCheck = db.prepare(
    'SELECT * FROM devices WHERE user_id = ? AND browser = ? AND os = ?'
  ).get(user.id, deviceInfo.browser, deviceInfo.os);

  if (!deviceCheck) {
    const deviceToken = crypto.randomBytes(32).toString('hex');
    db.prepare(
      'INSERT INTO devices (user_id, device_name, browser, os, ip_address, verification_token, verified) VALUES (?, ?, ?, ?, ?, ?, 1)'
    ).run(user.id, deviceInfo.device, deviceInfo.browser, deviceInfo.os, deviceInfo.ip, deviceToken);
    await sendDeviceVerificationEmail(user.email, deviceInfo, deviceToken);
  } else {
    db.prepare('UPDATE devices SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(deviceCheck.id);
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
};
