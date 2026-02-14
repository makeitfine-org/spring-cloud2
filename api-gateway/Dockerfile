FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY ../pom.xml /app/parent-pom.xml
COPY pom.xml .
COPY src ./src

RUN apk add --no-cache maven && \
    mvn install:install-file -Dfile=/app/parent-pom.xml -DgroupId=reacty.probe.one -DartifactId=microservices-parent -Dversion=0.0.1-SNAPSHOT -Dpackaging=pom && \
    mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
