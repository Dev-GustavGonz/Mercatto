# ================================================================
# MERCATTO BACKEND — Dockerfile Multietapa (Java 21 + Spring Boot 3)
# ================================================================

# Etapa 1: Compilación con Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Imagen final de ejecución ligera
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Crear usuario sin privilegios para máxima seguridad
RUN addgroup -S mercatto && adduser -S mercatto -G mercatto
USER mercatto

COPY --from=builder /app/target/*.jar app.jar

ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT:-8080} -jar app.jar"]
