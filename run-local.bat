@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Studio Audiobook Player using Node.js...
    node server.js --open
    goto :eof
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Studio Audiobook Player using Python http.server on http://localhost:8080 ...
    start "" "http://localhost:8080"
    python -m http.server 8080 --bind 127.0.0.1
    goto :eof
)

echo Error: Neither Node.js nor Python was found in PATH.
echo Opening index.html directly in your default browser...
start "" "%~dp0index.html"
pause
