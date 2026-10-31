<#
.SYNOPSIS
    Script Automatizado de Aprovisionamiento y Despliegue de Mercatto en Microsoft Azure.

.DESCRIPTION
    Crea el Grupo de Recursos, el Plan de App Service (Linux), la Web App para Spring Boot (Java 21),
    el servicio para el motor de automatización n8n y la configuración de variables de entorno.
#>

param(
    [string]$ResourceGroup = "rg-mercatto-prod",
    [string]$Location = "eastus",
    [string]$PlanName = "asp-mercatto-prod",
    [string]$Sku = "B1",
    [string]$AppName = "mercatto-api-$((Get-Random -Minimum 1000 -Maximum 9999))",
    [string]$N8nAppName = "mercatto-n8n-$((Get-Random -Minimum 1000 -Maximum 9999))"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       MERCATTO MARKETPLACE — DESPLIEGUE EN AZURE        " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si Azure CLI está disponible
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Azure CLI (az) no está instalado en este equipo." -ForegroundColor Red
    Write-Host "Instálalo ejecutando: winget install Microsoft.AzureCLI" -ForegroundColor Yellow
    Write-Host "O bien ejecuta estos comandos en la consola de https://portal.azure.com (Azure Cloud Shell)." -ForegroundColor Gray
    exit 1
}

# 2. Verificar inicio de sesión en Azure
Write-Host "[1/6] Verificando sesión en Azure CLI..." -ForegroundColor Cyan
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "Conectado como: $($account.user.name) en suscripción: $($account.name)" -ForegroundColor Green
} catch {
    Write-Host "Iniciando sesión en Azure..." -ForegroundColor Yellow
    az login --output table
}

# 3. Crear Grupo de Recursos
Write-Host ""
Write-Host "[2/6] Creando Grupo de Recursos ($ResourceGroup en $Location)..." -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location --output table

# 4. Crear Plan de App Service Linux
Write-Host ""
Write-Host "[3/6] Creando App Service Plan Linux ($PlanName - SKU: $Sku)..." -ForegroundColor Cyan
az appservice plan create `
    --name $PlanName `
    --resource-group $ResourceGroup `
    --location $Location `
    --is-linux `
    --sku $Sku `
    --output table

# 5. Crear Web App para Backend (Java 21)
Write-Host ""
Write-Host "[4/6] Creando Web App para Backend Spring Boot: $AppName..." -ForegroundColor Cyan
az webapp create `
    --name $AppName `
    --resource-group $ResourceGroup `
    --plan $PlanName `
    --runtime "JAVA:21-java21" `
    --output table

# Configurar variables de entorno y puertos en la Web App
Write-Host "Configurando variables de entorno del Backend..." -ForegroundColor Cyan
if (Test-Path "azure-application-settings.json") {
    az webapp config appsettings set `
        --name $AppName `
        --resource-group $ResourceGroup `
        --settings @azure-application-settings.json `
        --output none
    Write-Host "[OK] Variables de entorno configuradas exitosamente." -ForegroundColor Green
}

# Habilitar Always On para evitar suspensión (cold start) si el SKU no es Free
if ($Sku -ne "F1") {
    az webapp config set `
        --name $AppName `
        --resource-group $ResourceGroup `
        --always-on true `
        --output none
    Write-Host "[OK] Always-On habilitado (el backend no se dormirá jamás)." -ForegroundColor Green
}

# 6. Crear Web App para n8n (Docker container)
Write-Host ""
Write-Host "[5/6] Creando Web App para motor de Inteligencia Artificial n8n: $N8nAppName..." -ForegroundColor Cyan
az webapp create `
    --name $N8nAppName `
    --resource-group $ResourceGroup `
    --plan $PlanName `
    --deployment-container-image-name "docker.n8n.io/n8nio/n8n:latest" `
    --output table

Write-Host "Configurando variables de entorno de n8n en Azure..." -ForegroundColor Cyan
az webapp config appsettings set `
    --name $N8nAppName `
    --resource-group $ResourceGroup `
    --settings `
        WEBSITES_PORT=5678 `
        N8N_PORT=5678 `
        N8N_PROTOCOL=https `
        N8N_HOST="$N8nAppName.azurewebsites.net" `
        WEBHOOK_URL="https://$N8nAppName.azurewebsites.net/" `
        GENERIC_TIMEZONE=America/Bogota `
        N8N_BASIC_AUTH_ACTIVE=false `
    --output none

if ($Sku -ne "F1") {
    az webapp config set `
        --name $N8nAppName `
        --resource-group $ResourceGroup `
        --always-on true `
        --output none
}

# 7. Resumen Final
$BackendUrl = "https://$AppName.azurewebsites.net"
$N8nUrl = "https://$N8nAppName.azurewebsites.net"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "       ¡APROVISIONAMIENTO COMPLETADO EN AZURE! 🚀         " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Backend Spring Boot API : $BackendUrl" -ForegroundColor White
Write-Host "n8n AI & Automations     : $N8nUrl" -ForegroundColor White
Write-Host "Endpoint Webhook Chat    : $N8nUrl/webhook/mercatto-chat" -ForegroundColor White
Write-Host "Health Check             : $BackendUrl/api/health" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para desplegar el código del backend ahora mismo:" -ForegroundColor Yellow
Write-Host "  cd mercatto-backend" -ForegroundColor Gray
Write-Host "  mvn clean package -DskipTests" -ForegroundColor Gray
Write-Host "  az webapp deploy --resource-group $ResourceGroup --name $AppName --src-path target/mercatto-backend-1.0.0.jar --type jar" -ForegroundColor Gray
Write-Host ""
