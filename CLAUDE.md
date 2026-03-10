# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
# Build all modules (skip tests)
mvn clean package -DskipTests

# Build a single module
mvn clean package -DskipTests -pl order-service

# Run fast tests only (embedded Kafka + H2, no Docker)
mvn test

# Run full test suite including integration tests (requires Docker)
mvn verify

# Run tests for a single module
mvn test -pl order-service
```

> Checkstyle is enforced via `docs/checkstyle/checkstyle.xml` — runs as part of `mvn verify`

## Running the Stack

```bash
# Build JARs first, then start all services
mvn clean package -DskipTests && docker compose up --build

# Start without rebuilding images
docker compose up

# Start in background
docker compose up -d

# Debug mode (with remote debug ports)
docker compose -f docker-compose-debug.yml up --build

# Tear down
docker compose down
```

## Service Ports

| Service | URL |
|---|---|
| UI (React) | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| Kafka UI | http://localhost:8090 |
| Zipkin Traces | http://localhost:9411 |
| Order Service (direct) | http://localhost:8081 |
| Inventory Service (direct) | http://localhost:8082 |
| Delivery Service (direct) | http://localhost:8083 |

All business endpoints should be accessed via the gateway at port 8080.

## Architecture Overview

**Multi-module Maven project** with 5 Spring Boot 3.5.1 services using Java 21 and Spring Cloud 2025.0.1.

### Services

- **discovery-server** — Eureka server for service registration and discovery
- **api-gateway** — Spring Cloud Gateway; routes `/api/orders/**`, `/api/inventory/**`, `/api/deliveries/**` to respective services with Resilience4j circuit breakers
- **order-service** (port 8081) — manages order lifecycle
- **inventory-service** (port 8082) — manages stock; seeded with prod-1:100, prod-2:50, prod-3:200
- **delivery-service** (port 8083) — schedules deliveries

### Reactive Stack

All business services use:
- **Spring WebFlux** — reactive HTTP layer (`Mono`/`Flux` throughout)
- **R2DBC** — reactive PostgreSQL access (each service has its own DB on ports 5432–5434)

### Saga Pattern (Choreography via Kafka)

The core business flow is implemented as a choreography-based saga across Kafka topics:

```
POST /orders
  └─ OrderService: saves PENDING → publishes order-created

InventoryService (order-created)
  └─ Reserves stock → publishes inventory-reserved
  └─ Insufficient stock → publishes inventory-failed

DeliveryService (inventory-reserved)
  └─ Schedules delivery → publishes delivery-scheduled

OrderService (inventory-reserved) → status: INVENTORY_RESERVED
OrderService (delivery-scheduled) → status: CONFIRMED
OrderService (inventory-failed)   → status: CANCELLED
```

Kafka topics: `order-created`, `inventory-reserved`, `inventory-failed`, `delivery-scheduled`

### Resilience & Observability

- **Resilience4j** circuit breakers on all gateway routes (sliding window: 10, failure threshold: 50%, open-state wait: 10s)
- **Micrometer + OpenTelemetry → Zipkin** for distributed tracing (100% sampling)
- **Spring Boot Actuator** enabled on all services

## Key Patterns in the Code

- Event classes are plain Java records/POJOs serialized via Jackson; Kafka producer/consumer configs are in `KafkaConfig` classes per service
- Circuit breaker fallback methods live in `FallbackController` classes in the gateway
- R2DBC schema initialization is done via `schema.sql` in each service's `src/main/resources/`
- All services register with Eureka; gateway uses `lb://service-name` URIs for load-balanced routing
- Kafka listeners are not reactive contexts — use `.block(Duration.ofSeconds(10))` on returned `Mono`/`Flux`
- `KafkaConfig` uses `JsonDeserializer.USE_TYPE_INFO_HEADERS: false` and `TRUSTED_PACKAGES: "reacty.probe.one.inventory.*"` on all consumer factories
- Base package for all services: `reacty.probe.one.inventory.{service-name}`

## Testing

### Two-tier test strategy

- **`*FastTest.java`** — fast tests using `@EmbeddedKafka` + H2 in-memory DB, activated by `@ActiveProfiles("fast")`. Each service has `src/test/resources/application-fast.yml` and `schema-h2.sql` for H2 compatibility. Runs in `mvn test` (Surefire phase, **no Docker needed**).
- **`*IT.java`** — integration tests using Testcontainers (real PostgreSQL + Kafka containers) with `@SpringBootTest`, `@Testcontainers`, `@ActiveProfiles("test")`, and `@ServiceConnection`. Runs in `mvn verify` (Failsafe phase, **requires Docker**).

The gateway has a unit test using `@WebFluxTest`. Test profiles disable Eureka and Zipkin; see `src/test/resources/application-test.yml` per service.

```bash
# Run fast tests only (no Docker required)
mvn test

# Run all tests including integration tests (requires Docker)
mvn verify

# Run tests for a single module
mvn test -pl order-service

# Run full suite for a single module
mvn verify -pl order-service
```

## CI/CD

GitHub Actions at `.github/workflows/ci.yml`:
- Triggers on push to `main` or `develop`
- Steps: JDK 21 setup → `mvn install -N` (install parent POM first) → `mvn clean verify` (all tests + checkstyle)
- Timeout: 5 minutes

## UI (React Frontend)

React 18 + TypeScript + Redux Toolkit + TailwindCSS, served at http://localhost:3000.

### Running the UI locally

```bash
cd ui && npm install && npm run dev
```

### Key files

- `ui/src/services/api.ts` — RTK Query endpoints (proxies to gateway at `/api`)
- `ui/src/features/` — orders, inventory, deliveries, dashboard
- `ui/src/components/` — Navbar, Layout, StatusBadge, ErrorBanner

### UI Tests (Vitest + React Testing Library)

```bash
cd ui && npm test
```

## Remote Debugging

The debug compose file maps JDWP ports:

| Service           | Debug Port |
|-------------------|------------|
| discovery-server  | 5005       |
| api-gateway       | 5006       |
| order-service     | 5007       |
| inventory-service | 5008       |
| delivery-service  | 5009       |

## Claude Code Workflow

- Always use the **Context7 MCP** proactively when you need library/API documentation, code generation, or setup steps — don't wait to be explicitly asked
- When generating commit messages, do NOT add `Co-Authored-By: Claude` trailers
- When asked to `commit`, generate a semantic commit message (max 80 characters), stage relevant changes, and create the commit — no `Co-Authored-By` trailer
- When opening a URL in the browser that returns raw JSON, always apply pretty-print with syntax highlighting using `page.evaluate()` to inject a dark-themed HTML page with colored keys, strings, numbers, and nulls — do not wait to be asked
- After completing any code changes, always run the **QA-developer** agent to verify the changes — do not wait to be asked
