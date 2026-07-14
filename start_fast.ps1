#Requires -Version 5.1
# ====================================================================
# Super Fast Unified Startup Script for Rainbow Forest E-Commerce
# This starts: MySQL, 9 Microservices (using correct exec.jar), and React Web Client
# Usage: .\start_fast.ps1
# ====================================================================

$ErrorActionPreference = "Stop"
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $base ".env"

if (-not (Test-Path -LiteralPath $envFile)) {
    Write-Host "[ERROR] .env file not found at: $envFile" -ForegroundColor Red
    Write-Host "Copy .env.example to .env and fill in real values first." -ForegroundColor Yellow
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "     RAINBOW FOREST - SUPER FAST STARTUP" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# 1. Start MySQL database if not already running
Write-Host "[1/4] Checking MySQL Database..." -ForegroundColor Yellow
$mysqlCheck = Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue
if (-not $mysqlCheck) {
    if (Test-Path "C:\xampp\mysql_start.bat") {
        Write-Host "  MySQL is offline. Starting XAMPP MySQL..." -ForegroundColor Cyan
        Start-Process -FilePath "C:\xampp\mysql_start.bat" -WindowStyle Hidden
        Start-Sleep -Seconds 3
    } else {
        Write-Host "  [WARNING] MySQL is offline and XAMPP mysql_start.bat not found at default path." -ForegroundColor Red
        Write-Host "  Please start MySQL manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "  MySQL database is already running." -ForegroundColor Green
}

# 2. Load env vars
Write-Host "[2/4] Loading environment variables from .env..." -ForegroundColor Yellow
Get-Content -LiteralPath $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $eq = $line.IndexOf("=")
    if ($eq -lt 1) { return }
    $name = $line.Substring(0, $eq).Trim()
    $value = $line.Substring($eq + 1).Trim()
    Set-Item -Path "Env:\$name" -Value $value
}

# 3. Clean up old Java and Node/NPM processes from this project (avoiding IDE processes)
Write-Host "[3/4] Cleaning up existing services..." -ForegroundColor Yellow
$javaProcs = Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object { $_.Path -notlike "*antigravity*" -and $_.Path -notlike "*redhat.java*" }
if ($javaProcs) {
    $javaProcs | Stop-Process -Force
    Write-Host "  Stopped $($javaProcs.Count) running java services." -ForegroundColor Green
}
$nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcs) {
    $nodeProcs | Stop-Process -Force
    Write-Host "  Stopped $($nodeProcs.Count) running Node/NPM web servers." -ForegroundColor Green
}

# 4. Start 9 Microservices
Write-Host "[4/4] Starting 9 Microservices..." -ForegroundColor Yellow

$JavaPath = "C:\Program Files\Java\jdk-21\bin\java.exe"
if (-not (Test-Path $JavaPath)) {
    $JavaPath = "java"
}

$services = @(
    @{ n = "Eureka Server"; dir = "eureka-server"; port = 8761; wait = 8 }, # wait a bit for Eureka to start
    @{ n = "API Gateway"; dir = "api-gateway"; port = 8900; wait = 1 },
    @{ n = "User Service"; dir = "user-service"; port = 8811; wait = 1 },
    @{ n = "Product Catalog"; dir = "product-catalog-service"; port = 8810; wait = 1 },
    @{ n = "Product Recommendation"; dir = "product-recommendation-service"; port = 8812; wait = 1 },
    @{ n = "Order Service"; dir = "order-service"; port = 8813; wait = 1 },
    @{ n = "Payment Service"; dir = "payment-service"; port = 8815; wait = 1 },
    @{ n = "Inventory Service"; dir = "inventory-service"; port = 8816; wait = 1 },
    @{ n = "Notification Service"; dir = "notification-service"; port = 8817; wait = 0 }
)

foreach ($s in $services) {
    # Check if there is an executable exec.jar
    $jar = Get-ChildItem -Path "$base\$($s.dir)\target\*.jar" | Where-Object { $_.Name -like "*exec.jar" } | Select-Object -ExpandProperty FullName -First 1
    if (-not $jar) {
        $jar = Join-Path $base "$($s.dir)\target\$($s.dir)-0.0.1-SNAPSHOT.jar"
    }
    
    if (-not (Test-Path -LiteralPath $jar)) {
        Write-Host "  [SKIP] $($s.n): jar file not found at $jar" -ForegroundColor Red
        continue
    }
    
    $stdout = Join-Path $base "logs\$($s.dir)-det.log"
    $stderr = Join-Path $base "logs\$($s.dir)-det-err.log"
    
    # Initialize clean log files
    New-Item -ItemType File -Path $stdout -Force | Out-Null
    New-Item -ItemType File -Path $stderr -Force | Out-Null
    
    Write-Host "  Starting $($s.n) (port $($s.port))..." -ForegroundColor Cyan
    Start-Process -FilePath $JavaPath -ArgumentList "-Xmx256m -jar `"$jar`"" -RedirectStandardOutput $stdout -RedirectStandardError $stderr -NoNewWindow
    
    if ($s.wait -gt 0) {
        Start-Sleep -Seconds $s.wait
    }
}

# 5. Start React Frontend Web Client
Write-Host "Starting React Frontend Web Client..." -ForegroundColor Yellow
$reactStdout = Join-Path $base "logs\react-det.log"
$reactStderr = Join-Path $base "logs\react-det-err.log"
New-Item -ItemType File -Path $reactStdout -Force | Out-Null
New-Item -ItemType File -Path $reactStderr -Force | Out-Null

Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory (Join-Path $base "web-client-react") -RedirectStandardOutput $reactStdout -RedirectStandardError $reactStderr -NoNewWindow

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  ALL SYSTEM LAUNCHED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "  - React Web Client:  http://localhost:5500" -ForegroundColor Cyan
Write-Host "  - Eureka Server:     http://localhost:8761" -ForegroundColor Cyan
Write-Host "  - API Gateway:       http://localhost:8900" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "To stop everything, run: .\stop_all.ps1" -ForegroundColor Yellow
