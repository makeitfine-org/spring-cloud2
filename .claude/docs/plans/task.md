# Spring Cloud Reactive Microservices

## Planning
- [x] Create implementation plan
- [x] Get user approval

## Project Structure & Parent POM
- [x] Create parent `pom.xml` with Spring Boot 3.5.0, Spring Cloud 2025.0.0
- [x] Create `.gitignore`

## Infrastructure Services
- [x] Eureka Discovery Server
- [x] API Gateway (Spring Cloud Gateway with WebFlux)

## Domain Microservices
- [x] Order Service (WebFlux + R2DBC + Kafka Saga)
- [x] Inventory Service (WebFlux + R2DBC + Kafka Saga)
- [x] Delivery Service (WebFlux + R2DBC + Kafka Saga)

## Cross-Cutting Concerns
- [x] Circuit Breakers (Resilience4j)
- [x] Distributed Tracing (Micrometer + Zipkin)
- [x] Load Balancing (Spring Cloud LoadBalancer)
- [x] R2DBC Schema Initialization (ConnectionFactoryInitializer)

## Docker Compose
- [x] `docker-compose.yml` with all services, Kafka, Zipkin, PostgreSQL
- [x] Dockerfiles for all 5 modules

## Verification
- [x] Maven `clean compile` — BUILD SUCCESS (all 6 modules)
