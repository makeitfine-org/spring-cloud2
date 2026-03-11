# Plan: Create README.md

## Context
The project has no README.md. The user wants a comprehensive one covering architecture, workflow, build/run instructions, and all Docker Compose infrastructure. All information has been gathered from the codebase.

## File to Create
- `/home/eug/dev/projects/my/spring-cloud2/README.md`

---

## README Structure

### 1. Title + Overview
- Project name: **Spring Cloud Microservices**
- One-paragraph description: reactive, event-driven, saga-based order management system

### 2. Architecture Overview
- ASCII diagram of the full system (services, Kafka, DBs, Gateway, Eureka, Zipkin)
- Table of services with ports, purpose, tech stack
- Key technology stack list (Spring Boot 3.5.0, Java 21, Spring Cloud 2025.0.0, WebFlux, R2DBC, Kafka, PostgreSQL, Testcontainers)

### 3. Services Description
Brief section per service:
- **discovery-server** (8761): Eureka server, service registration
- **api-gateway** (8080): Spring Cloud Gateway, routing, Resilience4j circuit breakers, fallbacks
- **order-service** (8081): Order lifecycle, REST API, Postgres (orderdb on 5432), Kafka producer/consumer
- **inventory-service** (8082): Stock management, seeded data (prod-1:100, prod-2:50, prod-3:200), Postgres (inventorydb on 5433)
- **delivery-service** (8083): Delivery scheduling, Postgres (deliverydb on 5434)

### 4. Saga Workflow
- Explain choreography-based saga pattern
- ASCII sequence diagram showing the full event flow:
  ```
  Client → POST /api/orders → Gateway → OrderService
    OrderService → [order-created] → InventoryService
      InventoryService (success) → [inventory-reserved] → DeliveryService + OrderService
        DeliveryService → [delivery-scheduled] → OrderService (CONFIRMED)
      InventoryService (failure) → [inventory-failed] → OrderService (CANCELLED)
  ```
- Kafka topics table: topic name, producer, consumer(s), event payload

### 5. API Reference
Table of all REST endpoints accessible via gateway:
- Orders: POST /api/orders, GET /api/orders, GET /api/orders/{id}
- Inventory: GET /api/inventory, GET /api/inventory/{productId}, POST /api/inventory
- Deliveries: GET /api/deliveries, GET /api/deliveries/{id}, GET /api/deliveries/order/{orderId}

Request/response examples for POST /api/orders

### 6. Infrastructure (Docker Compose)
Table of all Docker containers:
| Container | Image | Port | Purpose |
|---|---|---|---|
| zookeeper | confluentinc/cp-zookeeper:7.6.0 | 2181 | Kafka coordination |
| kafka | confluentinc/cp-kafka:7.6.0 | 9092 | Message broker |
| kafka-ui | provectuslabs/kafka-ui:v0.7.2 | 8090 | Kafka web UI |
| zipkin | openzipkin/zipkin:latest | 9411 | Distributed tracing |
| postgres-order | postgres:16-alpine | 5432 | Order DB |
| postgres-inventory | postgres:16-alpine | 5433 | Inventory DB |
| postgres-delivery | postgres:16-alpine | 5434 | Delivery DB |
| discovery-server | (built) | 8761 | Eureka |
| api-gateway | (built) | 8080 | Gateway |
| order-service | (built) | 8081 | Orders |
| inventory-service | (built) | 8082 | Inventory |
| delivery-service | (built) | 8083 | Delivery |

Network: microservices-net (bridge)

### 7. Prerequisites
- Java 21+
- Maven 3.9+
- Docker + Docker Compose

### 8. Build & Run
```bash
# Build JARs (skip tests)
mvn clean package -DskipTests

# Build a single module
mvn clean package -DskipTests -pl order-service

# Start full stack (build + run)
mvn clean package -DskipTests && docker compose up --build

# Start without rebuilding images
docker compose up

# Start in background
docker compose up -d

# Debug mode (with remote JDWP ports)
docker compose -f docker-compose-debug.yml up --build

# Tear down
docker compose down
```

### 9. Service URLs Table
| Service | URL |
|---|---|
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| Kafka UI | http://localhost:8090 |
| Zipkin Traces | http://localhost:9411 |
| Order Service (direct) | http://localhost:8081 |
| Inventory Service (direct) | http://localhost:8082 |
| Delivery Service (direct) | http://localhost:8083 |

### 10. Usage Example
Step-by-step curl commands:
1. Place an order
2. Check order status
3. Check inventory
4. Check delivery

### 11. Testing
- Integration tests use Testcontainers
- `@SpringBootTest`, `@Testcontainers`, `@ActiveProfiles("test")`, `@ServiceConnection`
- Test profiles disable Eureka and Zipkin

```bash
# Run all tests (requires Docker for Testcontainers)
mvn test

# Run tests for a single service
mvn test -pl order-service

# Run only unit tests (API gateway)
mvn test -pl api-gateway
```

### 12. Remote Debugging
Debug port table and instructions for attaching from IDE.

### 13. Resilience & Observability
- Circuit breakers: sliding window 10, failure threshold 50%, open-state wait 10s
- Distributed tracing via Zipkin at http://localhost:9411 (100% sampling)
- Actuator endpoints: /actuator/health, /actuator/info

### 14. Project Structure
Directory tree of the multi-module Maven project

---

## Implementation Notes
- Single file: `/home/eug/dev/projects/my/spring-cloud2/README.md`
- Use GitHub-flavored Markdown with fenced code blocks and tables
- No external dependencies required
