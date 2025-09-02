@echo off
echo Starting MySQL Backend Server...
echo.
echo Server will run on: http://localhost:3001
echo Health check: http://localhost:3001/api/health
echo.
echo Press Ctrl+C to stop the server
echo.
node server-production.js
pause

