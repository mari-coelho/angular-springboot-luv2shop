
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .

WORKDIR /app/spring-boot-ecommerce

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/spring-boot-ecommerce/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]