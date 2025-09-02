@echo off
echo 🚀 Starting Firebase Hosting Deployment with HTTPS...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Run the deployment script
node deploy-firebase-https.js

echo.
echo ✅ Deployment script completed!
pause
