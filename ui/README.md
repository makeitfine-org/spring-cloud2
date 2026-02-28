# Spring Cloud Dashboard — UI

A React/TypeScript single-page application that provides a real-time monitoring dashboard for the Spring Cloud microservices backend. It visualises orders, inventory, and deliveries flowing through the Kafka-based choreography saga.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [State Management](#state-management)
  - [API Layer (RTK Query)](#api-layer-rtk-query)
  - [Routing](#routing)
  - [Domain Types](#domain-types)
- [Pages & Components](#pages--components)
  - [Dashboard](#dashboard)
  - [Orders](#orders)
  - [Inventory](#inventory)
  - [Deliveries](#deliveries)
  - [Shared Components](#shared-components)
- [Data Flow](#data-flow)
- [Development Setup](#development-setup)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Configuration](#configuration)

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI framework | React | 18.3 |
| Language | TypeScript | 5.7 |
| Build tool | Vite | 6 |
| Styling | Tailwind CSS | 4 |
| State / data fetching | Redux Toolkit + RTK Query | 2.5 |
| Routing | React Router DOM | 6 |
| Testing | Vitest + React Testing Library | 3 / 16 |

---

## Project Structure

```
ui/
├── src/
│   ├── app/
│   │   └── store.ts              # Redux store — single api slice
│   ├── components/
│   │   ├── ErrorBanner.tsx       # Inline error display
│   │   ├── Layout.tsx            # Shell: Navbar + side nav + <Outlet>
│   │   ├── Navbar.tsx            # Top header bar
│   │   └── StatusBadge.tsx       # Coloured pill for order/delivery status
│   ├── features/
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx     # Summary stat cards + recent orders table
│   │   ├── deliveries/
│   │   │   └── DeliveriesList.tsx
│   │   ├── inventory/
│   │   │   └── InventoryList.tsx
│   │   └── orders/
│   │       ├── CreateOrderForm.tsx  # Modal form — POST /api/orders
│   │       └── OrdersList.tsx       # Full orders table with delivery expansion
│   ├── services/
│   │   └── api.ts                # RTK Query createApi — all endpoints
│   ├── test/
│   │   ├── renderWithProviders.tsx  # Test helper: Redux Provider + MemoryRouter
│   │   └── setup.ts                 # @testing-library/jest-dom import
│   ├── types.ts                  # Domain interfaces (Order, Delivery, …)
│   ├── App.tsx                   # Route tree
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Tailwind entry (@import "tailwindcss")
│   └── vite-env.d.ts             # Vite client type declarations
├── vite.config.ts                # Vite + Vitest config
├── tsconfig.json                 # Composite project references
├── tsconfig.app.json             # App source: strict, ES2020, react-jsx
├── tsconfig.node.json            # Node/Vite config file
└── package.json
```

---

## Architecture

### State Management

The Redux store (`src/app/store.ts`) contains a single reducer slice: the RTK Query `api` cache. There is no additional application state in Redux — all UI-local state (modal open/closed, expanded row) lives in component `useState` hooks.

```
Redux store
└── api (RTK Query cache)
    ├── Order[]
    ├── InventoryItem[]
    └── Delivery[]
```

Two type aliases are exported for use with typed hooks:

```ts
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### API Layer (RTK Query)

All HTTP communication is centralised in `src/services/api.ts`. A single `createApi` instance points to `baseUrl: '/api'` (proxied to `http://localhost:8080` during development).

**Endpoints:**

| Hook | Method | Path | Tags |
|---|---|---|---|
| `useGetOrdersQuery` | GET | `/orders` | `Order` |
| `useGetOrderByIdQuery(id)` | GET | `/orders/:id` | `Order` (by id) |
| `useCreateOrderMutation` | POST | `/orders` | invalidates `Order` |
| `useGetInventoryQuery` | GET | `/inventory` | `Inventory` |
| `useGetInventoryByProductQuery(productId)` | GET | `/inventory/:productId` | `Inventory` (by id) |
| `useGetDeliveriesQuery` | GET | `/deliveries` | `Delivery` |
| `useGetDeliveryByOrderIdQuery(orderId)` | GET | `/deliveries/order/:orderId` | `Delivery` (by id) |

Tag-based cache invalidation ensures that after a successful `createOrder` mutation the orders list refetches automatically.

Several views pass `pollingInterval: 5000` to their query hooks so the UI auto-refreshes every 5 seconds without user interaction.

### Routing

React Router DOM v6 is configured in `App.tsx` using a nested route tree:

```
/           → Layout (persistent shell)
├── /       → Dashboard   (index)
├── orders  → OrdersList
├── inventory → InventoryList
└── deliveries → DeliveriesList
```

`Layout.tsx` renders `<Outlet />` for the active child route and provides the persistent side navigation.

### Domain Types

All backend response shapes are defined in `src/types.ts`:

```ts
type OrderStatus   = 'PENDING' | 'INVENTORY_RESERVED' | 'CONFIRMED' | 'CANCELLED'
type DeliveryStatus = 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED'

interface Order          { id, productId, quantity, price, status, createdAt, updatedAt }
interface InventoryItem  { productId, quantity, reservedQuantity, availableQuantity }
interface Delivery       { id, orderId, productId, quantity, status, scheduledAt }
interface CreateOrderRequest { productId, quantity, price }
```

These types are used as the generic parameters for all RTK Query endpoint definitions, giving full end-to-end type safety from network response to JSX render.

---

## Pages & Components

### Dashboard

**File:** `src/features/dashboard/Dashboard.tsx`

Shows a high-level summary of the system state. Polls every 5 seconds.

- **4 stat cards:** Total Orders, Inventory Items, Active Deliveries (SCHEDULED count), Confirmed Orders
- **Recent Orders table:** the 5 most recently created orders, sorted descending by `createdAt`
- Displays inline `ErrorBanner` for any failed query

### Orders

**File:** `src/features/orders/OrdersList.tsx`

Full paginated (unsorted) orders list. Polls every 5 seconds.

- Rows are sorted descending by `createdAt`
- Clicking a row expands an inline `OrderDetailRow` that lazily fetches the linked delivery via `useGetDeliveryByOrderIdQuery`
- **+ Create Order** button opens `CreateOrderForm` as a modal overlay

**CreateOrderForm** (`src/features/orders/CreateOrderForm.tsx`):
- Three fields: Product ID (string), Quantity (integer), Price (float)
- Submits via `useCreateOrderMutation`; on success closes the modal and the cache tag invalidation triggers a list refresh
- Validation errors from the API surface through `ErrorBanner`

### Inventory

**File:** `src/features/inventory/InventoryList.tsx`

Read-only view of current stock levels. Data is managed exclusively by the saga (InventoryService reserves stock when an `order-created` event is processed).

Columns: Product ID, Total Qty, Reserved, Available — where Available is coloured **green** when > 0 and **red** when 0.

### Deliveries

**File:** `src/features/deliveries/DeliveriesList.tsx`

All deliveries, sorted descending by `scheduledAt`. Polls every 5 seconds. Each row shows the delivery ID, linked order ID, product, quantity, status badge, and scheduled timestamp.

### Shared Components

#### `StatusBadge`

Renders a small coloured pill. Accepts a `status` string and an optional `type` (`'order'` | `'delivery'`, default `'order'`).

| Status | Colour |
|---|---|
| PENDING | Yellow |
| INVENTORY_RESERVED | Blue |
| CONFIRMED / DELIVERED | Green |
| CANCELLED / FAILED | Red |
| SCHEDULED | Indigo |
| IN_TRANSIT | Blue |
| Unknown | Gray |

#### `ErrorBanner`

Displays a red alert box. Accepts `error: unknown` (RTK Query error object or plain string) and an optional `title`. Returns `null` when `error` is falsy. Extracts the message from `error.data.message → error.error → error (string) → fallback`.

#### `Layout`

The application shell. Renders the `Navbar` at the top, a fixed-width (`w-56`) side navigation panel with `NavLink` items, and a scrollable `<main>` area for the active route's `<Outlet>`.

---

## Data Flow

```
Browser                        Vite Dev Server          API Gateway (port 8080)
  │                                  │                         │
  │  GET /api/orders                 │                         │
  │─────────────────────────────────>│  proxy /api → :8080     │
  │                                  │────────────────────────>│
  │                                  │                         │ → order-service
  │                                  │<────────────────────────│
  │<─────────────────────────────────│                         │
  │  RTK Query caches Order[]        │                         │
  │  React re-renders with data      │                         │
  │                                  │                         │
  │  POST /api/orders (createOrder)  │                         │
  │─────────────────────────────────>│────────────────────────>│
  │                                  │                         │ → Kafka → saga
  │<─────────────────────────────────│                         │
  │  cache tag 'Order' invalidated   │                         │
  │  GET /api/orders auto-refetches  │                         │
```

The UI is purely read/write over REST — it does not connect to Kafka directly. Live saga status updates (e.g. order moving from `PENDING` → `CONFIRMED`) are surfaced by the 5-second polling on the relevant query hooks.

---

## Development Setup

**Prerequisites:** Node 20+, npm 10+. The Spring Cloud backend stack must be running for API calls to succeed (see the root `CLAUDE.md` for `docker compose up` instructions).

```bash
# From the repo root — start the full backend
mvn clean package -DskipTests && docker compose up -d

# In the ui/ directory
cd ui
npm install
npm run dev       # starts Vite dev server at http://localhost:5173
```

The dev server proxies all `/api/*` requests to `http://localhost:8080` (the API Gateway), so no CORS configuration is needed.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start dev server with HMR at :5173 |
| `build` | `tsc -b && vite build` | Type-check then bundle to `dist/` |
| `preview` | `vite preview` | Serve the `dist/` bundle locally |
| `test` | `vitest` | Run tests in watch mode |
| `test:run` | `vitest run` | Run tests once (CI mode) |
| `coverage` | `vitest run --coverage` | Run tests and generate coverage report |

---

## Testing

Tests use **Vitest** with **React Testing Library** and **jsdom**. The test environment mirrors a real browser DOM.

### Test infrastructure

**`src/test/setup.ts`** — imported before every test file; extends `expect` with `@testing-library/jest-dom` matchers (`toBeInTheDocument`, `toHaveClass`, etc.).

**`src/test/renderWithProviders.tsx`** — wraps the component under test in the Redux `<Provider>` and `<MemoryRouter>` so tests can render any page or component without setting up the full app.

```ts
renderWithProviders(<InventoryList />)
```

### Test files

| File | Tests | What is covered |
|---|---|---|
| `StatusBadge.test.tsx` | 5 | Status text, colour classes per status and type, unknown-status fallback |
| `ErrorBanner.test.tsx` | 6 | Null when no error, string error, RTK Query error shape, default title |
| `CreateOrderForm.test.tsx` | 4 | Fields render, submit button, cancel calls onClose, form submit calls mutation |
| `InventoryList.test.tsx` | 4 | Loading state, empty state, row data, available colour (green/red) |
| `Dashboard.test.tsx` | 3 | 4 stat cards render, order count, empty-state message |

RTK Query hooks are mocked with `vi.mock('../../services/api', ...)` so tests run fully offline without a running backend.

### Running tests

```bash
cd ui
npm run test:run          # all 22 tests, CI output
npm run test              # watch mode for development
npm run coverage          # with v8 coverage report
```

---

## Build & Deployment

```bash
cd ui
npm run build
# produces ui/dist/
#   index.html          (entry)
#   assets/index-*.js   (~265 kB, ~86 kB gzipped)
#   assets/index-*.css  (~16 kB, ~4 kB gzipped)
```

The `dist/` folder is served by nginx inside the `ui` Docker container (see `ui/Dockerfile` and `ui/nginx.conf`). nginx is configured to forward `/api/*` requests to the API Gateway and serve the React bundle for all other paths (enabling client-side routing).

The UI container is wired into `docker-compose.yml` alongside the backend services. After `docker compose up --build` the dashboard is accessible at **http://localhost:3000** (or the port mapped in docker-compose).

---

## Configuration

All runtime configuration is compile-time or proxy-based — there are no `.env` files.

| Setting | Where | Value |
|---|---|---|
| API base URL (dev) | `vite.config.ts` proxy | `/api` → `http://localhost:8080` |
| API base URL (prod) | nginx `proxy_pass` | `/api` → `http://api-gateway:8080` |
| Polling interval | per-query call-site | 5000 ms |
| TypeScript target | `tsconfig.app.json` | ES2020 |
| Strict mode | `tsconfig.app.json` | enabled |
