#Requires -Version 5.1
# Stop all microservices and web client

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  STOPPING ALL MICROSERVICES + WEB CLIENT" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

$javaCount = (Get-Process -Name java -ErrorAction SilentlyContinue).Count
if ($javaCount -gt 0) {
    Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "  Stopped $javaCount java process(es)" -ForegroundColor Green
} else {
    Write-Host "  No java process running" -ForegroundColor Cyan
}

$pyProcs = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*Python312*" }
if ($pyProcs) {
    $pyProcs | Stop-Process -Force
    Write-Host "  Stopped $($pyProcs.Count) python web server" -ForegroundColor Green
} else {
    Write-Host "  No python web server running" -ForegroundColor Cyan
}

Write-Host "Done." -ForegroundColor Green
