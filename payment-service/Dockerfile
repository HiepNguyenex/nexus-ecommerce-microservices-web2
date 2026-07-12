# =============================================
# Dockerfile — payment-service
# Port: 8815 | DB: H2 in-memory + Kafka
# =============================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Nguyen Vu Hiep <2123110161>"
LABEL description="Payment Service — Xử lý thanh toán (Kafka Consumer/Producer), H2 DB"

WORKDIR /app

COPY target/payment-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8815

ENV KAFKA_BOOTSTRAP_SERVERS=kafka:29092

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
