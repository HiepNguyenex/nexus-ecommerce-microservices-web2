# =============================================
# Dockerfile — order-service
# Port: 8813 | DB: MySQL + Redis (Cart) + Kafka
# =============================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Nguyen Vu Hiep <2123110161>"
LABEL description="Order Service — Cart (Redis), Orders (MySQL), Kafka Producer, Circuit Breaker"

WORKDIR /app

COPY target/order-service-0.0.1-SNAPSHOT-exec.jar app.jar

EXPOSE 8813

ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_USERNAME=root
ENV MYSQL_PASSWORD=
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV KAFKA_BOOTSTRAP_SERVERS=kafka:29092

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
