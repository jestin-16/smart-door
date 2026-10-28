# Multi-stage Dockerfile for SmartDoorLight Spring Boot Backend
# Stage 1: Build JAR using Maven and Java 21
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper and POM first for effective layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B || true

# Copy source code and package
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal, secure JRE 21 runtime
FROM eclipse-temurin:21-jre-alpine

# Install curl for container healthcheck and tzdata for accurate timestamps
RUN apk add --no-cache curl tzdata && \
    addgroup -S smartdoor && adduser -S smartdoor -G smartdoor

WORKDIR /app

# Copy built artifact from builder
COPY --from=builder /build/target/*.jar app.jar
RUN chown -R smartdoor:smartdoor /app

# Switch to non-root user
USER smartdoor:smartdoor

EXPOSE 8080

# Tuned JVM parameters for AWS t3.small (2 GiB RAM):
# - Container memory awareness
# - Limit max heap to 384 MiB to safely prevent OOM
# - Non-blocking random number generation
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=40.0 -Xmx384m -Xms128m -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
