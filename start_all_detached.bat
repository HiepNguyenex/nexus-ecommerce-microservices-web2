@echo off
setlocal enabledelayedexpansion

set BASE=D:\Bai Tap\java-project\e-commerce-microservices-master
set JAVA="C:\Program Files\Java\jdk-21\bin\java.exe"

set JWT_SECRET=mySecretKeyForEcommerceMicroservicesApplicationLongEnough
set KAFKA_BOOTSTRAP_SERVERS=kafka-hiepweb2-nguyenvuhiep401-b7ce.h.aivencloud.com:19105
set KAFKA_SASL_USERNAME=avnadmin
set KAFKA_SASL_PASSWORD=AVNS_ZlTe0rPhFWbpWPic41k
set KAFKA_TRUSTSTORE_PASSWORD=mypassword
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_USERNAME=root
set MYSQL_PASSWORD=

echo ==========================================================
echo   STARTING ALL MICROSERVICES (DETACHED)
echo ==========================================================

cd /d %BASE%

:: Eureka Server (port 8761)
echo [1/9] Starting Eureka Server on port 8761...
start "Eureka" /B %JAVA% -Xmx256m -jar "%BASE%\eureka-server\target\eureka-server-0.0.1-SNAPSHOT.jar" > "%BASE%\logs\eureka-det.log" 2> "%BASE%\logs\eureka-det-err.log"
timeout /t 15 /nobreak >nul

:: API Gateway (port 8900) - needs Eureka
echo [2/9] Starting API Gateway on port 8900...
start "Gateway" /B %JAVA% -Xmx256m -jar "%BASE%\api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar" > "%BASE%\logs\gateway-det.log" 2> "%BASE%\logs\gateway-det-err.log"
timeout /t 15 /nobreak >nul

:: User Service (port 8811)
echo [3/9] Starting User Service on port 8811...
start "UserService" /B %JAVA% -Xmx256m -jar "%BASE%\user-service\target\user-service-0.0.1-SNAPSHOT.jar" > "%BASE%\logs\user-det.log" 2> "%BASE%\logs\user-det-err.log"
timeout /t 15 /nobreak >nul

:: Product Catalog (port 8810)
echo [4/9] Starting Product Catalog on port 8810...
start "Catalog" /B %JAVA% -Xmx256m -jar "%BASE%\product-catalog-service\target\product-catalog-service-0.0.1-SNAPSHOT.jar" > "%BASE%\logs\catalog-det.log" 2> "%BASE%\logs\catalog-det-err.log"
timeout /t 12 /nobreak >nul

:: Product Recommendation (port 8812)
echo [5/9] Starting Recommendation on port 8812...
start "Recommendation" /B %JAVA% -Xmx256m -jar "%BASE%\product-recommendation-service\target\product-recommendation-service-0.0.1-SNAPSHOT.jar" > "%BASE%\logs\recommendation-det.log" 2> "%BASE%\logs\recommendation-det-err.log"
timeout /t 12 /nobreak >nul

:: Order Service (port 8813)
echo [6/9] Starting Order Service on port 8813...
start "OrderService" /B %JAVA% -Xmx256m -jar "%BASE%\order-service\target\order-service-0.0.1-SNAPSHOT.jar" > "%BASE%\logs\order-det.log" 2> "%BASE%\logs\order-det-err.log"
timeout /t 15 /nobreak >nul

:: Payment Service (port 8815)
echo [7/9] Starting Payment Service on port 8815...
start "Payment" /B %JAVA% -Xmx256m -jar "%BASE%\payment-service\target\payment-service-0.0.1-SNAPSHOT.jar" > "%BASE%\logs\payment-det.log" 2> "%BASE%\logs\payment-det-err.log"
timeout /t 12 /nobreak >nul

:: Inventory Service (port 8816)
echo [8/9] Starting Inventory Service on port 8816...
start "Inventory" /B %JAVA% -Xmx256m -jar "%BASE%\inventory-service\target\inventory-service-0.0.1-SNAPSHOT.jar" > "%BASE%\logs\inventory-det.log" 2> "%BASE%\logs\inventory-det-err.log"
timeout /t 12 /nobreak >nul

:: Notification Service (port 8817)
echo [9/9] Starting Notification Service on port 8817...
start "Notification" /B %JAVA% -Xmx256m -jar "%BASE%\notification-service\target\notification-service-0.0.1-SNAPSHOT.jar" > "%BASE%\logs\notification-det.log" 2> "%BASE%\logs\notification-det-err.log"

echo ==========================================================
echo   ALL SERVICES STARTED
echo   Eureka:  http://localhost:8761
echo   Gateway: http://localhost:8900
echo   React:   http://localhost:5500
echo ==========================================================
