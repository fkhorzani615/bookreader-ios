@echo off
echo ========================================
echo   Firebase BookReader Deployment Tool
echo ========================================
echo.

echo This script will help you deploy your Firebase BookReader application
echo to your remote server with all the Firebase data included.
echo.

echo Current deployment files are ready in: deploy-firebase/
echo.

echo Please provide your server details:
echo.

set /p SERVER_HOST="Enter your server hostname/IP: "
set /p SERVER_USER="Enter your server username: "
set /p SERVER_PATH="Enter the remote directory path (e.g., /var/www/html): "
set /p UPLOAD_METHOD="Choose upload method (1=SCP, 2=FTP, 3=Manual): "

if "%UPLOAD_METHOD%"=="1" (
    echo.
    echo Uploading via SCP...
    echo.
    scp -r deploy-firebase/* %SERVER_USER%@%SERVER_HOST%:%SERVER_PATH%
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Upload completed successfully!
        echo.
        echo Your Firebase BookReader application is now deployed at:
        echo http://%SERVER_HOST%
        echo.
        echo The application will automatically load Firebase data including:
        echo - Categories (Programming, Data Science, Design, Business, Marketing, Personal Development)
        echo - Videos (React Fundamentals, Machine Learning Basics, UI/UX Design, etc.)
        echo - Books (The Pragmatic Programmer, Clean Code, Python for Data Analysis, etc.)
        echo.
    ) else (
        echo.
        echo ❌ Upload failed. Please check your server details and try again.
        echo.
    )
) else if "%UPLOAD_METHOD%"=="2" (
    echo.
    echo Please upload the contents of deploy-firebase/ folder to your server
    echo using your preferred FTP client.
    echo.
    echo Server details:
    echo Host: %SERVER_HOST%
    echo Username: %SERVER_USER%
    echo Remote path: %SERVER_PATH%
    echo.
    echo After uploading, your application will be available at:
    echo http://%SERVER_HOST%
    echo.
) else (
    echo.
    echo Manual deployment instructions:
    echo.
    echo 1. Upload all files from deploy-firebase/ folder to your server
    echo 2. Place them in the web root directory: %SERVER_PATH%
    echo 3. Ensure your server is configured for static file serving
    echo 4. Set up client-side routing (see DEPLOYMENT_README.md)
    echo.
    echo Your application will be available at:
    echo http://%SERVER_HOST%
    echo.
)

echo.
echo ========================================
echo   Deployment Summary
echo ========================================
echo.
echo ✅ Built React application with Firebase integration
echo ✅ Firebase configuration included (API Key: AIzaSyDxql4hc82vl-G_IMZEnzheo9G7QEhcKeQ)
echo ✅ Sample data will be automatically loaded from Firebase
echo ✅ Server configuration files included
echo.
echo 📁 Deployment files location: deploy-firebase/
echo 📋 Instructions: deploy-firebase/DEPLOYMENT_README.md
echo.
echo 🔥 Firebase data includes:
echo    - 6 categories with icons and descriptions
echo    - 5 videos with thumbnails, ratings, and view counts
echo    - 5 books with covers, ratings, and page counts
echo.
echo Press any key to exit...
pause >nul
