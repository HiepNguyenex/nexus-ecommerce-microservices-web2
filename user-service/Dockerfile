# =============================================
# Dockerfile — user-service
# Port: 8811 | DB: MySQL
# =============================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Nguyen Vu Hiep <2123110161>"
LABEL description="User Service — Registration, Login, JWT"

WORKDIR /app

COPY target/user-service-0.0.1-SNAPSHOT-exec.jar app.jar

EXPOSE 8811

ENV MYSQL_HOST=mysql
ENV MYSQL_PORT=3306
ENV MYSQL_USERNAME=root
ENV MYSQL_PASSWORD=
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV JWT_SECRET=mySecretKeyForEcommerceMicroservicesApplicationLongEnough

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
