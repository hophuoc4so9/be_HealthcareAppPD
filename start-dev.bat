@echo off
echo Starting Healthcare Admin Development Environment...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul