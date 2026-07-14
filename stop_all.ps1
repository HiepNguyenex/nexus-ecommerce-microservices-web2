#Requires -Version 5.1
# Stop all microservices and web client

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  STOPPING ALL MICROSERVICES + WEB CLIENT" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

$javaProcs = Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object { $_.Path -notlike "*antigravity*" -and $_.Path -notlike "*redhat.java*" }
if ($javaProcs) {
    $javaProcs | Stop-Process -Force
    Write-Host "  Stopped $($javaProcs.Count) java process(es)" -ForegroundColor Green
} else {
    Write-Host "  No Java microservice process running" -ForegroundColor Cyan
}

$pyProcs = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*Python312*" }
if ($pyProcs) {
    $pyProcs | Stop-Process -Force
    Write-Host "  Stopped $($pyProcs.Count) python web server" -ForegroundColor Green
} else {
    Write-Host "  No python web server running" -ForegroundColor Cyan
}

$nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcs) {
    $nodeProcs | Stop-Process -Force
    Write-Host "  Stopped $($nodeProcs.Count) node process(es)" -ForegroundColor Green
} else {
    Write-Host "  No node process running" -ForegroundColor Cyan
}

Write-Host "Done." -ForegroundColor Green
