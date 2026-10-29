<#
.SYNOPSIS
    Script Keep-Alive para evitar que el servicio gratuito de Render se duerma tras 15 minutos de inactividad.

.DESCRIPTION
    Realiza una petición HTTP GET cada 13 a 14 minutos (por defecto 13.5 minutos = 810 segundos) 
    al endpoint /api/health del backend en Render.

.PARAMETER Url
    La URL base de tu backend en Render (ej: https://mercatto-backend.onrender.com).
    Si no se especifica, toma la variable de entorno RENDER_URL o solicita al usuario.

.PARAMETER IntervalSeconds
    Intervalo en segundos entre cada petición (por defecto 810 s = 13 minutos y 30 segundos).
#>

param(
    [string]$Url = $env:RENDER_URL,
    [int]$IntervalSeconds = 810
)

$host.UI.RawUI.WindowTitle = "Mercatto — Render Keep-Alive (13.5 min)"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       MERCATTO — RENDER KEEP-ALIVE DAEMON (13-14 MIN)     " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $Url) {
    Write-Host ""
    Write-Host "Ingresa la URL pública de tu backend en Render:" -ForegroundColor Green
    Write-Host "(Ejemplo: https://mercatto-backend.onrender.com)" -ForegroundColor Gray
    $Url = Read-Host "URL de Render"
}

if (-not $Url) {
    Write-Host "[ERROR] Debes proporcionar una URL válida. Finalizando." -ForegroundColor Red
    exit 1
}

# Normalizar URL
$Url = $Url.Trim().TrimEnd('/')
if (-not $Url.StartsWith("http://") -and -not $Url.StartsWith("https://")) {
    $Url = "https://" + $Url
}

$PingEndpoint = if ($Url -match "/api/(health|ping)") { $Url } else { "$Url/api/health" }

Write-Host ""
Write-Host "Destino de Ping: $PingEndpoint" -ForegroundColor Green
Write-Host "Intervalo: $IntervalSeconds segundos (~$([math]::Round($IntervalSeconds / 60, 1)) minutos)" -ForegroundColor Green
Write-Host "Presiona Ctrl + C para detener en cualquier momento." -ForegroundColor Gray
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

$counter = 0

while ($true) {
    $counter++
    $hora = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $PingEndpoint -Method Get -TimeoutSec 20 -UseBasicParsing -Headers @{ "User-Agent" = "Mercatto-KeepAlive-Script/1.0" }
        $stopwatch.Stop()
        
        Write-Host "[$hora] Ping #$counter - Status $($response.StatusCode) - $($stopwatch.ElapsedMilliseconds) ms - Despierto OK" -ForegroundColor Green
    }
    catch {
        $msg = $_.Exception.Message
        Write-Host "[$hora] Ping #$counter - Advertencia/Error: $msg" -ForegroundColor Yellow
        Write-Host "  (Render puede estar iniciando en frío; el próximo ping reintentará)" -ForegroundColor DarkGray
    }

    # Variar ligeramente entre 13 y 14 minutos (780 a 840 segundos) si se usa el intervalo estándar
    $sleepTime = if ($IntervalSeconds -eq 810) { Get-Random -Minimum 780 -Maximum 840 } else { $IntervalSeconds }
    $proxima = (Get-Date).AddSeconds($sleepTime).ToString("HH:mm:ss")
    Write-Host "  -> Próximo ping a las $proxima (~$([math]::Round($sleepTime / 60, 1)) min)..." -ForegroundColor DarkGray

    Start-Sleep -Seconds $sleepTime
}
