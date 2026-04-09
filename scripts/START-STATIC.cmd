@echo off
title SND static server
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-static.ps1"
pause
