# Backend Setup Instructions

## Prerequisites
- PostgreSQL installed and running
- Node.js installed

## Setup Steps

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Create PostgreSQL database:**
```sql
CREATE DATABASE sageflow;
```

3. **Configure environment variables:**
- Copy `.env.example` to `.env`
- Update with your database credentials and email settings

For Gmail, use App Password:
- Go to Google Account → Security → 2-Step Verification → App passwords
- Generate password for "Mail"

4. **Start backend server:**
```bash
npm run dev
```

Server runs on http://localhost:5000

## Frontend Setup

Update API_URL in `src/contexts/AuthContext.tsx` if needed (default: http://localhost:5000/api/auth)

## Testing

1. Signup → Receive verification email
2. Click link in email → Email verified
3. Login with verified account
