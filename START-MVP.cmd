@echo off
title SND MVP
cd /d "%~dp0"

echo.
echo  Starting SND MVP (API :4000 + Web :3000)
echo  1) Run once from repo root:  npm install
echo  2) Then:  npm run mvp
echo.
echo  Opening two windows...
echo.

start "SND API" cmd /k "cd /d "%~dp0apps\snd-api" && npm run dev"
timeout /t 2 /nobreak >nul
start "SND Web" cmd /k "cd /d "%~dp0apps\snd-web" && npm run dev"

echo.
echo  Web: http://localhost:3000/
echo  API: http://127.0.0.1:4000/api/health
echo.
