import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const googleId = profile.id;

    let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    
    if (result.rows.length === 0) {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
        result = await pool.query(
          'INSERT INTO users (name, email, google_id, verified) VALUES ($1, $2, $3, TRUE) RETURNING *',
          [name, email, googleId]
        );
      } else {
        await pool.query('UPDATE users SET google_id = $1, verified = TRUE WHERE email = $2', [googleId, email]);
        result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      }
    }

    return done(null, result.rows[0]);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
