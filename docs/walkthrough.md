# Walkthrough — Spring Cloud Reactive Microservices

## What Was Built

A **multi-module Maven project** with 5 Spring Boot services implementing reactive microservices with the **Saga pattern** (choreography via Kafka).

| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.5.0 | Application framework |
| Spring Cloud | 2025.0.0 | Cloud-native infrastructure |
| Java | 21 | Language runtime |
| Project Reactor / WebFlux | — | Reactive programming |
| R2DBC + PostgreSQL | — | Reactive database access |
| Apache Kafka | — | Saga event bus |
| Resilience4j | — | Circuit breakers |
| Micrometer + Zipkin | — | Distributed tracing |

## Project Structure

```
outer-flare/
├── pom.xml                    # Parent POM
├── docker-compose.yml         # Full stack
├── discovery-server/          # Eureka (port 8761)
├── api-gateway/               # Spring Cloud Gateway (port 8080)
│   └── config/GatewayConfig   # Routes with circuit breakers + lb://
│   └── controller/Fallback    # Fallback responses
├── order-service/             # Port 8081
│   └── event/SagaEventConsumer  # Listens: inventory-reserved, inventory-failed, delivery-scheduled
├── inventory-service/         # Port 8082
│   └── event/SagaEventConsumer  # Listens: order-created → reserves stock
│   └── event/SagaEventProducer  # Publishes: inventory-reserved / inventory-failed
└── delivery-service/          # Port 8083
    └── event/SagaEventConsumer  # Listens: inventory-reserved → schedules delivery
    └── event/SagaEventProducer  # Publishes: delivery-scheduled
```

## Saga Flow

1. **Client** → `POST /api/orders` → **Order Service** saves order as `PENDING`, publishes `OrderCreatedEvent`
2. **Inventory Service** consumes `OrderCreatedEvent`, reserves stock
   - ✅ Success → publishes `InventoryReservedEvent`
   - ❌ Failure → publishes `InventoryFailedEvent` → Order → `CANCELLED`
3. **Delivery Service** consumes `InventoryReservedEvent`, schedules delivery → publishes `DeliveryScheduledEvent`
4. **Order Service** consumes `DeliveryScheduledEvent` → Order → `CONFIRMED`

## How to Run

```bash
# Build all modules
mvn clean package -DskipTests -f pom.xml

# Start everything
docker compose up --build
```

### Access Points

| Service | URL |
|---|---|
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| Zipkin Traces | http://localhost:9411 |

### Test the Saga

```bash
# 1. Add inventory (directly to inventory-service)
curl -X POST http://localhost:8082/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-1","quantity":100,"reservedQuantity":0}'

# 2. Create an order (via API Gateway)
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-1","quantity":2,"price":29.99}'

# 3. Check order status (should transition PENDING → CONFIRMED)
curl http://localhost:8080/api/orders/1

# 4. Check delivery was scheduled
curl http://localhost:8080/api/deliveries/order/1
```

## Verification Results

Maven compile of all 6 modules: **BUILD SUCCESS** (9.3s)

```
Microservices Parent ... SUCCESS [  0.051 s]
Discovery Server ....... SUCCESS [  0.860 s]
API Gateway ............ SUCCESS [  5.616 s]
Order Service .......... SUCCESS [  2.211 s]
Inventory Service ...... SUCCESS [  0.242 s]
Delivery Service ....... SUCCESS [  0.208 s]
```
