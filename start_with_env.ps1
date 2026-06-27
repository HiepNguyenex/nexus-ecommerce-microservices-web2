#Requires -Version 5.1
# ====================================================================
# Start all microservices with environment variables loaded from .env
# Usage: .\start_with_env.ps1 [-Hidden]
# ====================================================================

param(
    [switch]$Hidden = $true
)

$ErrorActionPreference = "Stop"
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $base ".env"

if (-not (Test-Path -LiteralPath $envFile)) {
    Write-Host "[ERROR] .env file not found at: $envFile" -ForegroundColor Red
    Write-Host "Copy .env.example to .env and fill in real values first." -ForegroundColor Yellow
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  LOADING ENV VARS FROM .env" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

Get-Content -LiteralPath $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $eq = $line.IndexOf("=")
    if ($eq -lt 1) { return }
    $name = $line.Substring(0, $eq).Trim()
    $value = $line.Substring($eq + 1).Trim()
    Set-Item -Path "Env:\$name" -Value $value
    $masked = if ($name -match "PASSWORD|SECRET") { "***" } else { $value }
    Write-Host "  $name = $masked" -ForegroundColor Cyan
}

$JavaPath = "C:\Program Files\Java\jdk-21\bin\java.exe"
$jdkOpts = "--add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED --add-opens java.base/java.text=ALL-UNNAMED --add-opens java.base/java.io=ALL-UNNAMED --add-opens java.base/java.net=ALL-UNNAMED"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  STARTING MICROSERVICES" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

$services = @(
    @{ n = "Eureka Server"; dir = "eureka-server"; port = 8761 },
    @{ n = "API Gateway"; dir = "api-gateway"; port = 8900 },
    @{ n = "User Service"; dir = "user-service"; port = 8811 },
    @{ n = "Product Catalog"; dir = "product-catalog-service"; port = 8810 },
    @{ n = "Product Recommendation"; dir = "product-recommendation-service"; port = 8812 },
    @{ n = "Order Service"; dir = "order-service"; port = 8813 },
    @{ n = "Payment Service"; dir = "payment-service"; port = 8815 },
    @{ n = "Inventory Service"; dir = "inventory-service"; port = 8816 },
    @{ n = "Notification Service"; dir = "notification-service"; port = 8817 }
)

foreach ($s in $services) {
    $jar = Join-Path $base "$($s.dir)\target\$($s.dir)-0.0.1-SNAPSHOT.jar"
    if (-not (Test-Path -LiteralPath $jar)) {
        Write-Host "  [SKIP] $($s.n): jar not found - run build_all.ps1 first" -ForegroundColor Yellow
        continue
    }
    Write-Host "  Starting $($s.n) (port $($s.port))..." -ForegroundColor Yellow
    if ($Hidden) {
        Start-Process -FilePath $JavaPath -ArgumentList "-jar `"$jar`"" -WindowStyle Hidden
    } else {
        Start-Process -FilePath $JavaPath -ArgumentList "/k title $($s.n) ($($s.port)) && `"$JavaPath`" -jar `"$jar`""
    }
    Start-Sleep -Seconds 1
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  All services started. Endpoints:" -ForegroundColor Green
Write-Host "    Eureka:       http://localhost:8761/" -ForegroundColor Cyan
Write-Host "    API Gateway:  http://localhost:8900/" -ForegroundColor Cyan
Write-Host "    Web Client:   run 'python -m http.server 5500' in web-client/" -ForegroundColor Cyan
Write-Host "  Stop all: Get-Process -Name java | Stop-Process -Force" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
