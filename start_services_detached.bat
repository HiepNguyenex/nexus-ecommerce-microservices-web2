@echo off
set JWT_SECRET=mySecretKeyForEcommerceMicroservicesApplicationLongEnough
set KAFKA_BOOTSTRAP_SERVERS=kafka-hiepweb2-nguyenvuhiep401-b7ce.h.aivencloud.com:19105
set KAFKA_SASL_USERNAME=avnadmin
set KAFKA_SASL_PASSWORD=AVNS_ZlTe0rPhFWbpWPic41k
set KAFKA_TRUSTSTORE_PASSWORD=mypassword
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_USERNAME=root
set MYSQL_PASSWORD=
set JDK_JAVA_OPTIONS=

start "API Gateway" /B "C:\Program Files\Java\jdk-21\bin\java.exe" -Xmx256m -jar "D:\Bai Tap\java-project\e-commerce-microservices-master\api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar" > "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\api-gateway-new.log" 2> "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\api-gateway-new-err.log"
timeout /t 12 /nobreak >nul
start "User Service" /B "C:\Program Files\Java\jdk-21\bin\java.exe" -Xmx256m -jar "D:\Bai Tap\java-project\e-commerce-microservices-master\user-service\target\user-service-0.0.1-SNAPSHOT.jar" > "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\user-service-new.log" 2> "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\user-service-new-err.log"
timeout /t 12 /nobreak >nul
start "Product Catalog" /B "C:\Program Files\Java\jdk-21\bin\java.exe" -Xmx256m -jar "D:\Bai Tap\java-project\e-commerce-microservices-master\product-catalog-service\target\product-catalog-service-0.0.1-SNAPSHOT.jar" > "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\product-catalog-service-new.log" 2> "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\product-catalog-service-new-err.log"
timeout /t 12 /nobreak >nul
start "Recommendation" /B "C:\Program Files\Java\jdk-21\bin\java.exe" -Xmx256m -jar "D:\Bai Tap\java-project\e-commerce-microservices-master\product-recommendation-service\target\product-recommendation-service-0.0.1-SNAPSHOT.jar" > "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\product-recommendation-service-new.log" 2> "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\product-recommendation-service-new-err.log"
timeout /t 12 /nobreak >nul
start "Payment Service" /B "C:\Program Files\Java\jdk-21\bin\java.exe" -Xmx256m -jar "D:\Bai Tap\java-project\e-commerce-microservices-master\payment-service\target\payment-service-0.0.1-SNAPSHOT.jar" > "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\payment-service-new.log" 2> "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\payment-service-new-err.log"
timeout /t 12 /nobreak >nul
start "Inventory Service" /B "C:\Program Files\Java\jdk-21\bin\java.exe" -Xmx256m -jar "D:\Bai Tap\java-project\e-commerce-microservices-master\inventory-service\target\inventory-service-0.0.1-SNAPSHOT.jar" > "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\inventory-service-new.log" 2> "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\inventory-service-new-err.log"
timeout /t 12 /nobreak >nul
start "Notification" /B "C:\Program Files\Java\jdk-21\bin\java.exe" -Xmx256m -jar "D:\Bai Tap\java-project\e-commerce-microservices-master\notification-service\target\notification-service-0.0.1-SNAPSHOT.jar" > "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\notification-service-new.log" 2> "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\notification-service-new-err.log"
timeout /t 12 /nobreak >nul
start "Order Service" /B "C:\Program Files\Java\jdk-21\bin\java.exe" -Xmx256m -jar "D:\Bai Tap\java-project\e-commerce-microservices-master\order-service\target\order-service-0.0.1-SNAPSHOT.jar" > "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\order-service-new.log" 2> "D:\Bai Tap\java-project\e-commerce-microservices-master\logs\order-service-new-err.log"
echo All services launched!
