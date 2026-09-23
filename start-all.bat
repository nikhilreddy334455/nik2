@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
echo Starting Campus Lost & Found System...

start "Campus Lost & Found - Backend" cmd /k "set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH% && cd backend && npm run dev"
start "Campus Lost & Found - Frontend" cmd /k "set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH% && cd frontend && npm run dev"

echo Backend and Frontend have been launched!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
