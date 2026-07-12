# =============================================
# Dockerfile — notification-service
# Port: 8817 | DB: MySQL + Kafka Consumer
# =============================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Nguyen Vu Hiep <2123110161>"
LABEL description="Notification Service — Kafka Consumer, Lưu notification log vào MySQL"

WORKDIR /app

COPY target/notification-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8817

ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_USERNAME=root
ENV MYSQL_PASSWORD=
ENV KAFKA_BOOTSTRAP_SERVERS=kafka:29092

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
