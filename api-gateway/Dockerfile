# =============================================
# Dockerfile — api-gateway
# Port: 8900
# =============================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Nguyen Vu Hiep <2123110161>"
LABEL description="API Gateway — JWT Auth, Rate Limiting, Routing"

WORKDIR /app

# Dùng exec jar vì api-gateway dùng spring-boot-maven-plugin với classifier=exec
COPY target/api-gateway-0.0.1-SNAPSHOT-exec.jar app.jar

EXPOSE 8900

ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
