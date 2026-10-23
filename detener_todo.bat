@echo off
chcp 65001 > nul
title Mercatto - Detener Todos los Servicios
color 0C
cls

echo ======================================================================
echo             MERCATTO - DETENIENDO TODOS LOS SERVICIOS
echo ======================================================================
echo.

echo [1/3] Liberando puerto 5173 (Frontend React)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a > nul 2>&1
)

echo [2/3] Liberando puertos del Backend (8080 y 8085)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a > nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8085 ^| findstr LISTENING') do (
    taskkill /F /PID %%a > nul 2>&1
)

echo [3/3] Liberando puerto 5678 (n8n)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5678 ^| findstr LISTENING') do (
    taskkill /F /PID %%a > nul 2>&1
)

echo.
echo ======================================================================
echo    Todos los procesos en puertos 5173, 8080 y 5678 han sido detenidos.
echo ======================================================================
echo.
pause
