# =============================================
# Dockerfile — inventory-service
# Port: 8816 | DB: H2 in-memory + Kafka
# =============================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Nguyen Vu Hiep <2123110161>"
LABEL description="Inventory Service — Quản lý tồn kho (Kafka Consumer), H2 DB"

WORKDIR /app

COPY target/inventory-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8816

ENV KAFKA_BOOTSTRAP_SERVERS=kafka:29092

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
