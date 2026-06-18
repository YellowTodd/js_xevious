@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -Uri 'http://localhost:8080/x2/index.html' -UseBasicParsing -TimeoutSec 2 | Out-Null; Start-Process 'http://localhost:8080'; exit 0 } catch { exit 1 }"
if %errorlevel%==0 exit /b 0
start "" "http://localhost:8080"
npm run dev
