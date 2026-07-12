# =============================================
# Dockerfile — product-catalog-service
# Port: 8810 | DB: MySQL + Redis Cache
# =============================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Nguyen Vu Hiep <2123110161>"
LABEL description="Product Catalog Service — CRUD sản phẩm với Redis @Cacheable"

WORKDIR /app

COPY target/product-catalog-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8810

ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_USERNAME=root
ENV MYSQL_PASSWORD=
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
