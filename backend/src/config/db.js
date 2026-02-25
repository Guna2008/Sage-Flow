import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      google_id VARCHAR(255) UNIQUE,
      verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS devices (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      device_name VARCHAR(255),
      browser VARCHAR(255),
      os VARCHAR(255),
      ip_address VARCHAR(50),
      verified BOOLEAN DEFAULT FALSE,
      verification_token VARCHAR(255),
      last_login TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};
