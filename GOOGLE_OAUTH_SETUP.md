# Google OAuth Setup Guide

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen (add your email as test user)
6. Application type: **Web application**
7. Add Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
8. Copy **Client ID** and **Client Secret**

## 2. Update backend/.env

```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## 3. Setup PostgreSQL

Open pgAdmin or psql and run:
```sql
CREATE DATABASE sageflow;
```

Update `backend/.env` with your postgres password:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/sageflow
```

## 4. Configure Email (Gmail)

1. Enable 2-Step Verification in Google Account
2. Go to Security → App passwords
3. Generate password for "Mail"
4. Update `backend/.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

## 5. Start Backend

```bash
cd backend
npm run dev
```

## How It Works

1. **First Login**: User clicks "Continue with Google" → Redirects to Google → Account created → Device verification email sent
2. **New Device**: User logs in from different device → Email sent to verify new device
3. **Same Device**: User can login directly without verification
4. **Data Isolation**: Each user's data is separate, identified by user_id in database
