@echo off
echo Starting Full Application...
echo.
echo Starting MySQL Backend Server...
start "MySQL Backend" cmd /k "node server-production.js"
echo Backend started on: http://localhost:3001
echo.
echo Starting React Frontend...
start "React Frontend" cmd /k "npm start"
echo Frontend will start on: http://localhost:3000
echo.
echo Both servers are starting...
echo.
echo Backend Health Check: http://localhost:3001/api/health
echo Frontend: http://localhost:3000
echo.
pause

