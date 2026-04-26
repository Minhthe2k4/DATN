# Stage 1: Build the application
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY pom.xml .
COPY mvnw .
COPY .mvn ./.mvn
COPY src ./src
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

COPY --from=build /app/target/DATN-0.0.1-SNAPSHOT.jar app.jar

# Expose the port
EXPOSE 10000

# Environment variables with defaults
ENV SPRING_DATASOURCE_URL=""
ENV SPRING_DATASOURCE_USERNAME=""
ENV SPRING_DATASOURCE_PASSWORD=""
ENV APP_FRONTEND_URL=""
ENV YT_DLP_PATH="/usr/local/bin/yt-dlp"
ENV FFMPEG_PATH="/usr/bin/ffmpeg"

ENTRYPOINT ["java", "-Xmx384m", "-Xms384m", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
