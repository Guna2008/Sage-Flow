# SETUP INSTRUCTIONS - Follow These Steps

## Step 1: PostgreSQL Database
1. Open pgAdmin (installed with PostgreSQL)
2. Connect with your postgres password
3. Right-click "Databases" → Create → Database
4. Name: sageflow
5. Click Save

## Step 2: Google OAuth (Browser opened)
1. In Google Cloud Console → Create Project (or select existing)
2. Click "Enable APIs and Services" → Search "Google+ API" → Enable
3. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
4. Configure consent screen (add your email as test user)
5. Application type: Web application
6. Authorized redirect URIs: http://localhost:5000/api/auth/google/callback
7. Copy Client ID and Client Secret

## Step 3: Update backend/.env
Open backend/.env and update:
```
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/sageflow
GOOGLE_CLIENT_ID=paste-your-client-id-here
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

## Step 4: Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Generate password for "Mail"
3. Copy 16-digit password to EMAIL_PASS in .env

## Step 5: Start Backend
Open terminal in project folder:
```
cd backend
npm run dev
```

## Step 6: Start Frontend (New Terminal)
```
npm run dev
```

## Done!
- Signup sends verification email
- Google login works
- Device tracking enabled
