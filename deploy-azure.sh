#!/usr/bin/env bash
# ================================================================
# MERCATTO MARKETPLACE — DESPLIEGUE AUTOMATIZADO EN AZURE (BASH)
# ================================================================
set -e

RESOURCE_GROUP="${1:-rg-mercatto-prod}"
LOCATION="${2:-eastus}"
PLAN_NAME="${3:-asp-mercatto-prod}"
SKU="${4:-B1}"
RAND=$((1000 + RANDOM % 9000))
APP_NAME="${5:-mercatto-api-$RAND}"
N8N_APP_NAME="${6:-mercatto-n8n-$RAND}"

echo "=========================================================="
echo "       MERCATTO MARKETPLACE — DESPLIEGUE EN AZURE        "
echo "=========================================================="
echo ""

if ! command -v az &> /dev/null; then
    echo "[ERROR] Azure CLI (az) no está instalado."
    exit 1
fi

echo "[1/6] Verificando cuenta de Azure..."
az account show --output table || az login --output table

echo "[2/6] Creando Grupo de Recursos ($RESOURCE_GROUP en $LOCATION)..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output table

echo "[3/6] Creando App Service Plan Linux ($PLAN_NAME - SKU: $SKU)..."
az appservice plan create \
    --name "$PLAN_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --is-linux \
    --sku "$SKU" \
    --output table

echo "[4/6] Creando Web App para Backend Spring Boot: $APP_NAME..."
az webapp create \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$PLAN_NAME" \
    --runtime "JAVA:21-java21" \
    --output table

if [ -f "azure-application-settings.json" ]; then
    echo "Configurando variables de entorno en el Backend..."
    az webapp config appsettings set \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --settings @azure-application-settings.json \
        --output none
fi

if [ "$SKU" != "F1" ]; then
    az webapp config set \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --always-on true \
        --output none
fi

echo "[5/6] Creando Web App para n8n: $N8N_APP_NAME..."
az webapp create \
    --name "$N8N_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$PLAN_NAME" \
    --deployment-container-image-name "docker.n8n.io/n8nio/n8n:latest" \
    --output table

az webapp config appsettings set \
    --name "$N8N_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --settings \
        WEBSITES_PORT=5678 \
        N8N_PORT=5678 \
        N8N_PROTOCOL=https \
        N8N_HOST="${N8N_APP_NAME}.azurewebsites.net" \
        WEBHOOK_URL="https://${N8N_APP_NAME}.azurewebsites.net/" \
        GENERIC_TIMEZONE=America/Bogota \
        N8N_BASIC_AUTH_ACTIVE=false \
    --output none

if [ "$SKU" != "F1" ]; then
    az webapp config set \
        --name "$N8N_APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --always-on true \
        --output none
fi

echo ""
echo "=========================================================="
echo "       ¡DESPLIEGUE COMPLETADO EN AZURE CON ÉXITO! 🚀     "
echo "=========================================================="
echo "Backend URL: https://${APP_NAME}.azurewebsites.net"
echo "n8n URL:     https://${N8N_APP_NAME}.azurewebsites.net"
echo "Webhook:     https://${N8N_APP_NAME}.azurewebsites.net/webhook/mercatto-chat"
echo "=========================================================="
