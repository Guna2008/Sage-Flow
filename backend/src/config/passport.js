import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const googleId = profile.id;

      let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
      
      if (!user) {
        user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        
        if (!user) {
          const result = db.prepare(
            'INSERT INTO users (name, email, google_id, verified) VALUES (?, ?, ?, 1)'
          ).run(name, email, googleId);
          user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        } else {
          db.prepare('UPDATE users SET google_id = ?, verified = 1 WHERE email = ?').run(googleId, email);
          user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export default passport;
