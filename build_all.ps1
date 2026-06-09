$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$services = @("order-service", "payment-service", "inventory-service", "notification-service", "user-service", "product-recommendation-service")

foreach ($service in $services) {
    Write-Host "========================================="
    Write-Host "Building $service..."
    Write-Host "========================================="
    Push-Location "D:\Bai Tap\java-project\e-commerce-microservices-master\$service"
    .\mvnw.cmd clean package -DskipTests
    Pop-Location
}
Write-Host "All builds completed!"
