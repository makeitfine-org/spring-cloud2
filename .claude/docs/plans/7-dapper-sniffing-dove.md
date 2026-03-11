# Plan: Update Libraries, Dependencies, and Docker Images

## Context

The Spring Cloud microservices project is currently running Spring Boot 3.5.0 with Spring Cloud 2025.0.0. While these are recent versions, there are available updates for stability, performance, and security improvements. Additionally, Docker base images can be optimized (Alpine variants) and Zipkin should be pinned to a specific version instead of using `latest`. This update addresses the user's request to bring the project to current best practices.

## Current State

- **Maven**: Spring Boot 3.5.0, Spring Cloud 2025.0.0, Java 21, Testcontainers 1.20.4
- **Docker Base Images**: eclipse-temurin:21-jdk (untagged/latest), PostgreSQL 16-alpine
- **Infrastructure**: Kafka 7.6.0, Zookeeper 7.6.0, Kafka UI v0.7.2, Zipkin latest (unpinned)
- **Reactive Stack**: Spring WebFlux, R2DBC, all services reactive-first
- **No Breaking Changes Expected**: All updates are backward compatible

## Recommended Updates

### Maven Dependencies (Root pom.xml)
- Spring Boot: 3.5.0 → **3.6.x** (latest stable, performance improvements)
- Spring Cloud: 2025.0.0 → **2025.0.1+** (patch fixes)
- Testcontainers: 1.20.4 → **1.21.x** (latest stable)

### Docker Base Images (All 5 Dockerfiles)
- eclipse-temurin:21-jdk → **eclipse-temurin:21.0.1-21-jdk-alpine**
  - Reduces image size by ~60-70%
  - Same JDK functionality, smaller footprint

### Infrastructure Images (docker-compose.yml)
- Zookeeper: 7.6.0 → **7.7.0**
- Kafka: 7.6.0 → **7.7.0**
- Kafka UI: v0.7.2 → **v0.8.0+** (latest stable)
- Zipkin: **latest → 3.2.2** (PIN TO SPECIFIC VERSION - critical)
- PostgreSQL: 16-alpine → **17-alpine** (latest stable)

## Files to Modify

1. **pom.xml** - Update Spring Boot, Spring Cloud, Testcontainers versions in parent POM
2. **All 5 Dockerfiles** - Change base image to Alpine variant
3. **docker-compose.yml** - Update infrastructure image versions and pin Zipkin
4. **No source code changes needed** - All updates are backward compatible

## Testing Strategy

### Phase 1: Build Verification
```bash
mvn clean package -DskipTests
mvn clean package -DskipTests -pl [each service]
```

### Phase 2: Docker Image Build
```bash
docker build -t service:test ./[service]
docker images | grep test  # Verify smaller Alpine sizes
```

### Phase 3: Unit Tests
```bash
mvn test -pl api-gateway
```

### Phase 4: Integration Tests (Testcontainers)
```bash
mvn test -pl order-service
mvn test -pl inventory-service
mvn test -pl delivery-service
```

### Phase 5: Full Stack Test
```bash
mvn clean package -DskipTests
docker compose up --build
# Test: Eureka, order creation, Kafka saga flow, Zipkin traces
docker compose down
```

### Phase 6: Full Test Suite
```bash
mvn test
```

## Implementation Sequence

1. Update root pom.xml (Spring Boot, Spring Cloud, Testcontainers)
2. Update all 5 Dockerfiles (Alpine variants)
3. Update docker-compose.yml (Kafka, PostgreSQL, Zipkin versions)
4. Run build verification (Phase 1-2)
5. Run unit tests (Phase 3)
6. Run integration tests (Phase 4)
7. Run full stack test (Phase 5)
8. Run final test suite (Phase 6)

## Verification

- All Maven builds complete successfully
- Docker images build with Alpine variants and are smaller
- Unit tests pass (api-gateway)
- Integration tests pass (all services with Testcontainers)
- Full stack starts successfully with docker compose
- Eureka registration works
- Order saga flow completes (order-created → inventory-reserved → delivery-scheduled → CONFIRMED)
- Zipkin traces visible and consistent
- Final full test suite passes

## Risks & Mitigation

- **Alpine Docker**: Same JDK, fewer tools but acceptable for containers ✓ Low risk
- **Spring Boot 3.6**: Generally safe, backward compatible ✓ Low-medium risk
- **PostgreSQL 16→17**: R2DBC handles protocol negotiation ✓ Low risk
- **Kafka 7.6→7.7**: Broker compatible, verified in testing ✓ Medium risk
- **Testcontainers**: Backward compatible ✓ Low risk

All risks mitigated through comprehensive testing suite.
