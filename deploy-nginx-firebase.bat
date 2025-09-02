@echo off
echo 🚀 Starting Nginx + Firebase Deployment...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Run the deployment script
node deploy-nginx-firebase.js

echo.
echo ✅ Nginx + Firebase deployment package created!
echo 📁 Check the deploy-nginx/ folder for deployment files
pause
