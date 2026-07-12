# =============================================
# Dockerfile — eureka-server
# Port: 8761
# =============================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Nguyen Vu Hiep <2123110161>"
LABEL description="Eureka Service Discovery Server"

WORKDIR /app

COPY target/eureka-server-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
