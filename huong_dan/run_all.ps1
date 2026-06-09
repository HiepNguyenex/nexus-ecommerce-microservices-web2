$env:JAVA_HOME = "C:\\Program Files\\Java\\jdk-21"
$env:JDK_JAVA_OPTIONS = "--add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED --add-opens java.base/java.text=ALL-UNNAMED --add-opens java.base/java.io=ALL-UNNAMED --add-opens java.base/java.net=ALL-UNNAMED --add-opens java.desktop/java.awt.font=ALL-UNNAMED"
$JavaPath = "C:\\Program Files\\Java\\jdk-21\\bin\\java.exe"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   KHOI CHAY E-COMMERCE MICROSERVICES (MYSQL & IN-MEMORY)  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# 1. Start Eureka Server
Write-Host "Dang khoi chay Eureka Server (Port 8761) trong cua so moi..." -ForegroundColor Yellow
$EurekaJar = "D:\Bai Tap\java-project\e-commerce-microservices-master\eureka-server\target\eureka-server-0.0.1-SNAPSHOT.jar"
Start-Process cmd.exe -ArgumentList "/k title Eureka Server (8761) && `"$JavaPath`" -jar `"$EurekaJar`""

Write-Host "Cho 10 giay de Eureka Server khoi dong hoan toan..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# 2. Start API Gateway
Write-Host "Dang khoi chay API Gateway (Port 8900)..." -ForegroundColor Yellow
$GatewayJar = "D:\Bai Tap\java-project\e-commerce-microservices-master\api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar"
Start-Process cmd.exe -ArgumentList "/k title API Gateway (8900) && `"$JavaPath`" -jar `"$GatewayJar`""

# 3. Start user-service
Write-Host "Dang khoi chay User Service (Port 8811)..." -ForegroundColor Yellow
$UserJar = "D:\Bai Tap\java-project\e-commerce-microservices-master\user-service\target\user-service-0.0.1-SNAPSHOT.jar"
Start-Process cmd.exe -ArgumentList "/k title User Service (8811) && `"$JavaPath`" -jar `"$UserJar`""

# 4. Start product-catalog-service
Write-Host "Dang khoi chay Product Catalog Service (Port 8810)..." -ForegroundColor Yellow
$CatalogJar = "D:\Bai Tap\java-project\e-commerce-microservices-master\product-catalog-service\target\product-catalog-service-0.0.1-SNAPSHOT.jar"
Start-Process cmd.exe -ArgumentList "/k title Product Catalog (8810) && `"$JavaPath`" -jar `"$CatalogJar`""

# 5. Start product-recommendation-service
Write-Host "Dang khoi chay Product Recommendation Service (Port 8812)..." -ForegroundColor Yellow
$RecJar = "D:\Bai Tap\java-project\e-commerce-microservices-master\product-recommendation-service\target\product-recommendation-service-0.0.1-SNAPSHOT.jar"
Start-Process cmd.exe -ArgumentList "/k title Product Recommendation (8812) && `"$JavaPath`" -jar `"$RecJar`""

# 6. Start order-service
Write-Host "Dang khoi chay Order Service (Port 8813)..." -ForegroundColor Yellow
$OrderJar = "D:\Bai Tap\java-project\e-commerce-microservices-master\order-service\target\order-service-0.0.1-SNAPSHOT.jar"
Start-Process cmd.exe -ArgumentList "/k title Order Service (8813) && `"$JavaPath`" -jar `"$OrderJar`""

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Tat ca cac service da duoc mo trong cac cua so Command Prompt rieng." -ForegroundColor Green
Write-Host "1. Eureka Dashboard: http://localhost:8761/" -ForegroundColor Cyan
Write-Host "2. API Gateway: http://localhost:8900/" -ForegroundColor Cyan
Write-Host "De dung mot service, hay dong cua so Command Prompt tuong ung." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
