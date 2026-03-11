# Walkthrough — Spring Cloud Reactive Microservices

## What Was Built

A **multi-module Maven project** with 6 modules (1 parent POM + 5 Spring Boot services) implementing reactive microservices with the **Saga pattern** (choreography via Kafka).

| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.5.0 | Application framework |
| Spring Cloud | 2025.0.0 | Cloud-native infrastructure |
| Java | 21 | Language runtime |
| Spring WebFlux | — | Reactive HTTP layer (`Mono`/`Flux`) |
| R2DBC + PostgreSQL | — | Reactive database access (port per service: 5432/5433/5434) |
| Apache Kafka | — | Saga event bus (topics: order-created, inventory-reserved, inventory-failed, delivery-scheduled) |
| Resilience4j | — | Circuit breakers (sliding window 10, failure threshold 50%, open wait 10s) |
| Micrometer + OpenTelemetry | — | Distributed tracing |
| Zipkin | — | Trace visualization (100% sampling) |
| Testcontainers | — | Integration testing with real containers |

## Project Structure

```
spring-cloud2/
├── pom.xml                          # Parent POM (Spring Boot 3.5.0, Spring Cloud 2025.0.0, Java 21)
├── CLAUDE.md                        # Claude Code guidance
├── README.md                        # Complete project documentation
├── docker-compose.yml               # Full stack (all services + infrastructure)
├── docker-compose-debug.yml         # Debug stack with JDWP ports (5005-5009)
├── docs/
│   ├── implementation_plan.md       # Detailed implementation specs
│   └── walkthrough.md               # This file
├── discovery-server/                # Eureka Server (port 8761)
├── api-gateway/                     # Spring Cloud Gateway (port 8080)
│   ├── config/GatewayConfig.java    # Routes with circuit breaker filters
│   └── controller/FallbackController.java # Fallback responses
├── order-service/                   # Port 8081
│   ├── model/Order.java             # Status: PENDING/INVENTORY_RESERVED/CONFIRMED/CANCELLED
│   ├── event/SagaEventConsumer.java # Listens: inventory-reserved, inventory-failed, delivery-scheduled
│   ├── config/KafkaConfig.java      # Kafka producer/consumer
│   ├── config/DatabaseConfig.java   # R2DBC configuration
│   └── schema.sql                   # Table: orders
├── inventory-service/               # Port 8082
│   ├── event/SagaEventConsumer.java # Listens: order-created → reserves stock
│   ├── event/SagaEventProducer.java # Publishes: inventory-reserved / inventory-failed
│   ├── config/KafkaConfig.java      # Kafka configuration
│   ├── config/DatabaseConfig.java   # R2DBC configuration
│   └── schema.sql                   # Table: inventory_items (pre-seeded: prod-1:100, prod-2:50, prod-3:200)
└── delivery-service/                # Port 8083
    ├── event/SagaEventConsumer.java # Listens: inventory-reserved → schedules delivery
    ├── event/SagaEventProducer.java # Publishes: delivery-scheduled
    ├── config/KafkaConfig.java      # Kafka configuration
    ├── config/DatabaseConfig.java   # R2DBC configuration
    └── schema.sql                   # Table: deliveries
```

## Saga Flow

```
Client → POST /api/orders
  └─ OrderService: saves PENDING, publishes order-created

InventoryService (listens order-created)
  └─ Reserves stock
  ├─ ✅ Success: publishes inventory-reserved
  └─ ❌ Failure: publishes inventory-failed → Order → CANCELLED

DeliveryService (listens inventory-reserved)
  └─ Schedules delivery → publishes delivery-scheduled

OrderService (listens)
  ├─ inventory-reserved → update order to INVENTORY_RESERVED (waiting for delivery)
  ├─ delivery-scheduled → update order to CONFIRMED
  └─ inventory-failed → update order to CANCELLED
```

**Order Status Transitions:**
| Event | Status |
|-------|--------|
| Order created | `PENDING` |
| `inventory-reserved` received | `INVENTORY_RESERVED` |
| `delivery-scheduled` received | `CONFIRMED` |
| `inventory-failed` received | `CANCELLED` |

## How to Run

### Build

```bash
# Build all modules (skip tests)
mvn clean package -DskipTests

# Build a single module
mvn clean package -DskipTests -pl order-service
```

### Start Stack

```bash
# Start everything (rebuilds images)
docker compose up --build

# Start in background
docker compose up -d --build

# Start without rebuilding images
docker compose up

# Debug mode (with JDWP ports 5005-5009)
docker compose -f docker-compose-debug.yml up --build

# Tear down
docker compose down
```

### Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| API Gateway | http://localhost:8080 | All business traffic |
| Eureka Dashboard | http://localhost:8761 | Service registry UI |
| Kafka UI | http://localhost:8090 | Topic/message inspection |
| Zipkin Traces | http://localhost:9411 | Distributed trace visualization |
| Order Service (direct) | http://localhost:8081 | Bypass gateway |
| Inventory Service (direct) | http://localhost:8082 | Bypass gateway |
| Delivery Service (direct) | http://localhost:8083 | Bypass gateway |

> **Note:** Inventory is pre-seeded with prod-1:100, prod-2:50, prod-3:200. Use the gateway (port 8080) for all business endpoints.

## Test the Saga

### Happy Path (sufficient stock)

```bash
# 1. Create an order (via API Gateway)
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-1","quantity":2,"price":29.99}'
# Response: {"id":1,"productId":"prod-1","quantity":2,"price":29.99,"status":"PENDING",...}

# 2. Check order status (waits ~1s for Saga)
sleep 1
curl http://localhost:8080/api/orders/1
# Status progression: PENDING → INVENTORY_RESERVED → CONFIRMED

# 3. Verify delivery was scheduled
curl http://localhost:8080/api/deliveries/order/1
# Response: {"id":1,"orderId":1,"productId":"prod-1","quantity":2,"status":"SCHEDULED",...}

# 4. Check inventory updated
curl http://localhost:8080/api/inventory/prod-1
# quantity should be 98 (100 - 2), reservedQuantity should be 0
```

### Failure Path (insufficient stock)

```bash
# Request more than available inventory
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-2","quantity":999,"price":9.99}'

# Check order status
sleep 1
curl http://localhost:8080/api/orders/2
# Response: {"status":"CANCELLED","failureReason":"Insufficient stock",...}

# No delivery should be created
curl http://localhost:8080/api/deliveries/order/2
# 404 Not Found
```

### Inspect Kafka Topics

Open Kafka UI at http://localhost:8090:
- **Topics:** order-created, inventory-reserved, inventory-failed, delivery-scheduled
- **Messages:** Browse published/consumed events by order

### View Distributed Traces

Open Zipkin at http://localhost:9411:
- Select a service or trace ID
- View full request flow across all services with timing

## Running Tests

Integration tests use **Testcontainers** — Docker must be running.

```bash
# Run all tests
mvn test

# Run integration tests for a single service (requires Docker)
mvn test -pl order-service

# Run gateway unit tests only (no Docker needed)
mvn test -pl api-gateway
```

Each business service integration test:
- Uses `@SpringBootTest`, `@Testcontainers`, `@ActiveProfiles("test")`
- Automatic container wiring via `@ServiceConnection` (PostgreSQL, Kafka)
- Test profile disables Eureka and Zipkin

Gateway has unit tests using `@WebFluxTest` (mocked dependencies, no Docker).

## Remote Debugging

```bash
docker compose -f docker-compose-debug.yml up --build
```

Connect your IDE to `localhost:<port>`:

| Service | Port |
|---------|------|
| discovery-server | 5005 |
| api-gateway | 5006 |
| order-service | 5007 |
| inventory-service | 5008 |
| delivery-service | 5009 |

## Verification Results

Maven compile of all 6 modules: **BUILD SUCCESS**

```
Microservices Parent ............ SUCCESS
Discovery Server ............... SUCCESS
API Gateway .................... SUCCESS
Order Service .................. SUCCESS
Inventory Service .............. SUCCESS
Delivery Service ............... SUCCESS
```

Docker Compose health check:
- All services register with Eureka (http://localhost:8761)
- Kafka topics auto-created
- All DBs initialized with schema.sql
- Zipkin ready to receive traces (http://localhost:9411)
- Kafka UI ready (http://localhost:8090)
