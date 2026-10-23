@echo off
chcp 65001 > nul
title Mercatto - Lanzador de Servicios
color 0B
cls

echo ======================================================================
echo             MERCATTO E-COMMERCE + N8N - INICIANDO SISTEMA
echo ======================================================================
echo.

:: 1. Verificar MySQL
echo [1/4] Verificando servicio de MySQL (Puerto 3306)...
netstat -ano | findstr :3306 | findstr LISTENING > nul
if %errorlevel% neq 0 (
    echo [AVISO] MySQL no detectado en puerto 3306. Intentando iniciar servicio MySQL...
    net start MySQL84 > nul 2>&1 || net start MySQL80 > nul 2>&1 || net start MySQL > nul 2>&1
) else (
    echo [OK] MySQL esta activo en puerto 3306.
)
echo.

:: 2. Iniciar Backend (Spring Boot)
echo [2/4] Iniciando Backend Spring Boot (Puerto 8085)...
start "[1/3] Mercatto Backend (Spring Boot)" cmd /k "cd /d C:\Users\gjgh2\Downloads\mercatto\mercatto\mercatto-backend && mvn spring-boot:run"
echo.

:: 3. Iniciar Frontend (Vite)
echo [3/4] Iniciando Frontend React + Vite (Puerto 5173)...
start "[2/3] Mercatto Frontend (Vite)" cmd /k "cd /d C:\Users\gjgh2\Downloads\mercatto\mercatto\mercatto-frontend && npm run dev"
echo.

:: 4. Iniciar n8n
echo [4/4] Iniciando n8n Workflows (Puerto 5678)...
start "[3/3] Mercatto n8n Automation" cmd /k "n8n start"
echo.

echo ======================================================================
echo    Todos los servicios fueron lanzados en consolas independientes.
echo    Esperando 6 segundos para abrir las URLs en tu navegador...
echo ======================================================================
timeout /t 6 /nobreak > nul

start http://localhost:5173
start http://localhost:5678

echo.
echo [LISTO] Navegador abierto. Puedes minimizar esta ventana o cerrarla.
echo Para apagar todos los servicios usa 'detener_todo.bat'.
echo.
pause
