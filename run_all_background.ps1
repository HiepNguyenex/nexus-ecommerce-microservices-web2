$env:JAVA_HOME = "C:\\Program Files\\Java\\jdk-21"
$env:JDK_JAVA_OPTIONS = "--add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED --add-opens java.base/java.text=ALL-UNNAMED --add-opens java.base/java.io=ALL-UNNAMED --add-opens java.base/java.net=ALL-UNNAMED --add-opens java.desktop/java.awt.font=ALL-UNNAMED"
$JavaPath = "C:\\Program Files\\Java\\jdk-21\\bin\\java.exe"

$baseDir = "D:\Bai Tap\java-project\e-commerce-microservices-master"

# Create log directory
$logDir = "$baseDir\logs"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

Write-Host "Starting Eureka Server..."
$EurekaProc = Start-Process -FilePath $JavaPath -ArgumentList "-jar `"$baseDir\eureka-server\target\eureka-server-0.0.1-SNAPSHOT.jar`"" -NoNewWindow -PassThru -RedirectStandardOutput "$logDir\eureka.log" -RedirectStandardError "$logDir\eureka-error.log"

Write-Host "Waiting 12 seconds for Eureka to start..."
Start-Sleep -Seconds 12

Write-Host "Starting API Gateway..."
$GatewayProc = Start-Process -FilePath $JavaPath -ArgumentList "-jar `"$baseDir\api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar`"" -NoNewWindow -PassThru -RedirectStandardOutput "$logDir\gateway.log" -RedirectStandardError "$logDir\gateway-error.log"

Write-Host "Starting User Service..."
$UserProc = Start-Process -FilePath $JavaPath -ArgumentList "-jar `"$baseDir\user-service\target\user-service-0.0.1-SNAPSHOT.jar`"" -NoNewWindow -PassThru -RedirectStandardOutput "$logDir\user.log" -RedirectStandardError "$logDir\user-error.log"

Write-Host "Starting Product Catalog Service..."
$CatalogProc = Start-Process -FilePath $JavaPath -ArgumentList "-jar `"$baseDir\product-catalog-service\target\product-catalog-service-0.0.1-SNAPSHOT.jar`"" -NoNewWindow -PassThru -RedirectStandardOutput "$logDir\catalog.log" -RedirectStandardError "$logDir\catalog-error.log"

Write-Host "Starting Product Recommendation Service..."
$RecProc = Start-Process -FilePath $JavaPath -ArgumentList "-jar `"$baseDir\product-recommendation-service\target\product-recommendation-service-0.0.1-SNAPSHOT.jar`"" -NoNewWindow -PassThru -RedirectStandardOutput "$logDir\recommendation.log" -RedirectStandardError "$logDir\recommendation-error.log"

Write-Host "Starting Order Service..."
$OrderProc = Start-Process -FilePath $JavaPath -ArgumentList "-jar `"$baseDir\order-service\target\order-service-0.0.1-SNAPSHOT.jar`"" -NoNewWindow -PassThru -RedirectStandardOutput "$logDir\order.log" -RedirectStandardError "$logDir\order-error.log"

Write-Host "Starting Payment Service..."
$PaymentProc = Start-Process -FilePath $JavaPath -ArgumentList "-jar `"$baseDir\payment-service\target\payment-service-0.0.1-SNAPSHOT.jar`"" -NoNewWindow -PassThru -RedirectStandardOutput "$logDir\payment.log" -RedirectStandardError "$logDir\payment-error.log"

Write-Host "Starting Inventory Service..."
$InventoryProc = Start-Process -FilePath $JavaPath -ArgumentList "-jar `"$baseDir\inventory-service\target\inventory-service-0.0.1-SNAPSHOT.jar`"" -NoNewWindow -PassThru -RedirectStandardOutput "$logDir\inventory.log" -RedirectStandardError "$logDir\inventory-error.log"

Write-Host "Starting Notification Service..."
$NotifProc = Start-Process -FilePath $JavaPath -ArgumentList "-jar `"$baseDir\notification-service\target\notification-service-0.0.1-SNAPSHOT.jar`"" -NoNewWindow -PassThru -RedirectStandardOutput "$logDir\notification.log" -RedirectStandardError "$logDir\notification-error.log"

Write-Host "All services started!"

Write-Host "Logs are saved in D:\Bai Tap\java-project\e-commerce-microservices-master\logs"
Write-Host "Keeping this process alive..."

while ($true) {
    Start-Sleep -Seconds 5
}
