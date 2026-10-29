@echo off
chcp 65001 >nul
title Mercatto - Render Keep-Alive (13 a 14 min)

echo ==========================================================
echo       MERCATTO - RENDER KEEP-ALIVE (13-14 MIN)
echo ==========================================================
echo Este script mantiene despierto tu servicio gratuito de Render
echo enviando una peticion cada 13 a 14 minutos.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0keep-alive-render.ps1" %*

pause
