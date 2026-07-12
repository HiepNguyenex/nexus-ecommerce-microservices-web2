# =============================================
# Dockerfile — product-recommendation-service
# Port: 8812 | DB: MySQL + OpenFeign
# =============================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Nguyen Vu Hiep <2123110161>"
LABEL description="Product Recommendation Service — Đánh giá sản phẩm, OpenFeign với Eureka"

WORKDIR /app

COPY target/product-recommendation-service-0.0.1-SNAPSHOT-exec.jar app.jar

EXPOSE 8812

ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_USERNAME=root
ENV MYSQL_PASSWORD=

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
