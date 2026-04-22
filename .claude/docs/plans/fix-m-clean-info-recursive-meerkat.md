# Plan: Fix testcontainers missing version errors in Maven reactor build

## Context
`mvn clean` fails with 4 "missing version" errors per service (3 services affected) for
`org.testcontainers:{junit-jupiter,postgresql,kafka,r2dbc}`. The parent POM imports
`testcontainers-bom` explicitly in `<dependencyManagement>`. Spring Boot 3.5.1 already
manages testcontainers natively via `spring-boot-dependencies`; the explicit BOM import is
redundant and breaks the reactor scan when the BOM artifact is not in the local Maven cache.

## Recommended Fix

**File:** `pom.xml` (parent) — single change

Remove the `testcontainers-bom` entry from `<dependencyManagement>`:

```xml
<!-- DELETE this block -->
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-bom</artifactId>
    <version>${testcontainers.version}</version>
    <type>pom</type>
    <scope>import</scope>
</dependency>
```

**Keep** `<testcontainers.version>1.21.0</testcontainers.version>` in `<properties>` —
Spring Boot's BOM reads that property and versions all testcontainers artifacts via
the standard property-override mechanism (documented since Boot 3.1).

No changes to child POMs — child dependencies already omit `<version>` tags, which is
correct once the parent's BOM (spring-boot-dependencies) provides the managed versions.

## Files Modified
- `pom.xml` — remove `testcontainers-bom` from `<dependencyManagement>` (lines 46-52)

## Verification
```bash
mvn clean install -DskipTests   # must succeed with no missing-version errors
mvn test -pl order-service      # unit tests green
mvn verify -pl order-service    # integration tests green (requires Docker)
```
