# Estágio 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .

# AQUI ESTÁ A CORREÇÃO: Entramos na subpasta onde o pom.xml vive
WORKDIR /app/spring-boot-ecommerce

RUN mvn clean package -DskipTests

# Estágio 2: Execução
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# AQUI TAMBÉM MUDOU: O jar agora é gerado dentro da subpasta/target
COPY --from=build /app/spring-boot-ecommerce/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]