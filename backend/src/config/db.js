// In-memory database - no setup required
const users = [];
const devices = [];
let userIdCounter = 1;
let deviceIdCounter = 1;

export const db = {
  prepare: (sql) => ({
    get: (...params) => {
      if (sql.includes('SELECT * FROM users WHERE email')) {
        return users.find(u => u.email === params[0]);
      }
      if (sql.includes('SELECT * FROM users WHERE google_id')) {
        return users.find(u => u.google_id === params[0]);
      }
      if (sql.includes('SELECT * FROM users WHERE id')) {
        return users.find(u => u.id === params[0]);
      }
      if (sql.includes('SELECT * FROM users WHERE verification_token')) {
        return users.find(u => u.verification_token === params[0]);
      }
      if (sql.includes('SELECT * FROM devices WHERE verification_token')) {
        return devices.find(d => d.verification_token === params[0]);
      }
      if (sql.includes('SELECT * FROM devices WHERE user_id')) {
        return devices.find(d => d.user_id === params[0] && d.browser === params[1] && d.os === params[2]);
      }
      return null;
    },
    run: (...params) => {
      if (sql.includes('INSERT INTO users')) {
        const user = {
          id: userIdCounter++,
          name: params[0],
          email: params[1],
          password: params[2] || null,
          google_id: params[3] || null,
          verified: params[4] || 1,
          verification_token: params[3] || null,
          created_at: new Date().toISOString()
        };
        users.push(user);
        return { lastInsertRowid: user.id };
      }
      if (sql.includes('INSERT INTO devices')) {
        const device = {
          id: deviceIdCounter++,
          user_id: params[0],
          device_name: params[1],
          browser: params[2],
          os: params[3],
          ip_address: params[4],
          verification_token: params[5],
          verified: params[6] || 1,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        devices.push(device);
        return { lastInsertRowid: device.id };
      }
      if (sql.includes('UPDATE users SET google_id')) {
        const user = users.find(u => u.email === params[1]);
        if (user) {
          user.google_id = params[0];
          user.verified = 1;
        }
      }
      if (sql.includes('UPDATE users SET verified')) {
        const user = users.find(u => u.verification_token === params[0]);
        if (user) {
          user.verified = 1;
          user.verification_token = null;
        }
      }
      if (sql.includes('UPDATE devices SET verified')) {
        const device = devices.find(d => d.verification_token === params[0]);
        if (device) {
          device.verified = 1;
          device.verification_token = null;
        }
      }
      if (sql.includes('UPDATE devices SET last_login')) {
        const device = devices.find(d => d.id === params[0]);
        if (device) device.last_login = new Date().toISOString();
      }
      return {};
    }
  })
};

export const initDB = () => {
  console.log('✅ In-memory database initialized');
};
