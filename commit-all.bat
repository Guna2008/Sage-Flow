@echo off
echo Starting Git commits...

git add backend/package.json backend/.env.example backend/src/config/db.js backend/src/config/email.js backend/init.sql
git commit -m "feat: Add PostgreSQL database configuration and email service"

git add backend/src/config/passport.js
git commit -m "feat: Add Google OAuth authentication with Passport.js"

git add backend/src/controllers/authController.js backend/src/routes/auth.js
git commit -m "feat: Implement authentication controllers with device tracking"

git add backend/src/server.js backend/.env backend/README.md
git commit -m "feat: Setup Express server with session and CORS support"

git add src/contexts/AuthContext.tsx
git commit -m "feat: Update AuthContext to use backend API instead of localStorage"

git add src/pages/Login.tsx src/pages/signup.tsx
git commit -m "feat: Add Google Sign In button and async authentication"

git add src/pages/VerifyEmail.tsx src/pages/VerifyDevice.tsx src/pages/AuthCallback.tsx
git commit -m "feat: Add email and device verification pages"

git add src/App.tsx
git commit -m "feat: Add routes for verification and OAuth callback"

git add src/components/OnboardingTour.tsx src/components/HelpTooltip.tsx
git commit -m "feat: Add onboarding tour and help tooltips for user guidance"

git add src/pages/Overview.tsx src/pages/Tasks.tsx src/pages/Studyplanner.tsx GOOGLE_OAUTH_SETUP.md
git commit -m "feat: Integrate onboarding tour and help tooltips across pages"

echo.
echo All commits completed successfully!
echo.
echo To push to remote, run: git push origin main
pause
