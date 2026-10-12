FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine

RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV UPLOAD_DIR=/app/uploads
RUN mkdir -p $UPLOAD_DIR

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]