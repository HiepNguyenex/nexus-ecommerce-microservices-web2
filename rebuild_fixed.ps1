$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$services = @("product-catalog-service", "order-service", "product-recommendation-service", "api-gateway")

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Rebuild 3 services sau khi fix code" -ForegroundColor Cyan
Write-Host "  1. Rate Limiting (api-gateway)" -ForegroundColor Cyan
Write-Host "  2. @Cacheable (product-catalog-service)" -ForegroundColor Cyan
Write-Host "  3. Fix Feign URL (order-service, recommendation-service)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$failed = @()

foreach ($service in $services) {
    Write-Host ""
    Write-Host "--- Building $service ---" -ForegroundColor Yellow
    Push-Location "D:\Bai Tap\java-project\e-commerce-microservices-master\$service"
    .\mvnw.cmd clean package -DskipTests -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: $service built successfully" -ForegroundColor Green
    } else {
        Write-Host "FAIL: $service build failed!" -ForegroundColor Red
        $failed += $service
    }
    Pop-Location
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
if ($failed.Count -eq 0) {
    Write-Host " Tất cả builds thành công!" -ForegroundColor Green
    Write-Host " Restart các service bằng: .\start_fast.ps1" -ForegroundColor Green
} else {
    Write-Host " FAILED: $($failed -join ', ')" -ForegroundColor Red
}
Write-Host "=========================================" -ForegroundColor Cyan
