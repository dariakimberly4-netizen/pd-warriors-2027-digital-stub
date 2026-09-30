@echo off
title PD Warriors 2027 - Shared Local Event Server
cd /d "%~dp0"

echo.
echo ============================================================
echo  PD WARRIORS 2027 - SHARED LOCAL EVENT SERVER
echo ============================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed on this laptop.
  echo.
  echo Install the current Node.js LTS version once, then run this file again.
  echo After installation, restart the laptop if Windows asks you to.
  echo.
  pause
  exit /b 1
)

echo Starting the shared event server...
echo Keep this window OPEN during the event.
echo.
node local-server.js

echo.
echo The local server stopped.
pause
