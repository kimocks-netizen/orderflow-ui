# OrderFlow — Frontend

React + Vite frontend for the OrderFlow internal order management system.

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tool and dev server
- **TanStack Query** — server state, caching, mutations. The `isPending` state from `useMutation` disables the submit button while a request is in flight, preventing duplicate order submissions
- **Zustand** — client state (auth, theme)
- **React Router v6** — routing and route protection
- **shadcn/ui** + **Tailwind CSS** — UI components and styling
- **react-hook-form** + **zod** — form handling and validation
- **Recharts** — charts on dashboard and reports
- **Sonner** — toast notifications
- **js-cookie** — JWT token storage

---

## Prerequisites

- Node.js 18+
- The backend running on `http://localhost:8000` (see backend README)

---

## Setup & Running Locally

### 1. Enter the frontend directory

```bash
cd orderflow-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

A `.env` file is included in the repository for demo purposes. No setup needed to run locally.

> To point to a different backend host, copy the example and update the URL:
> ```bash
> cp .env.example .env
> ```

### 4. Start the development server

```bash
npm run dev
```

App runs at `http://localhost:5173`

### 5. Login

```
Email:    admin@orderflow.com
Password: password
```

---

## Build for Production

```bash
npm run build
```

Output is in `dist/`. Preview the production build locally:

```bash
npm run preview
```

---

## Features

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Public home page with feature overview and API health check |
| Login | `/login` | JWT authentication |
| Dashboard | `/dashboard` | Metrics, orders by status, orders-per-day chart, recent activity |
| Orders | `/orders` | Paginated order list with search, status filter, and date range filter |
| Order Detail | `/orders/:id` | Order info, status pipeline, status history, action buttons |
| New Order | `/orders/new` | Create order form |
| Reports | `/reports` | 30-day trend chart (bar/line toggle), key insights, top customers |

## Stretch Goals Completed

The assessment listed the following as optional extras. All three were implemented:

| Stretch Goal | Implemented | Details |
|---|---|---|
| Status history / audit trail | Yes | Every status change on an order is recorded with `from_status`, `to_status`, and `changed_at`. Displayed as a full chronological timeline on the order detail page. |
| Additional dashboard metrics | Yes | Total revenue, average order value, orders today, and an interactive 7-day orders-per-day bar chart with a detailed hover tooltip. |
| Reports page | Yes | Trend chart (bar or line, switchable) over any custom date range, plus cancellation rate, avg fulfilment days, peak day, revenue vs prior month, and top 5 customers by order count. |

## Architecture

### State management split

```
TanStack Query  — all server data (orders, dashboard, reports)
Zustand         — client-only state (auth token + user, theme preference)
```

Server data never goes into Zustand. UI-only state never goes into TanStack Query.

### Feature module pattern

Each domain has its own folder under `src/features/`:

```
features/
├── auth/
│   ├── api.ts        — typed API call functions
│   ├── mutations.ts  — useMutation hooks
│   └── LoginForm.tsx — form component
├── orders/
│   ├── api.ts
│   ├── queries.ts    — useQuery hooks
│   ├── mutations.ts
│   └── schemas.ts    — zod validation schemas
├── dashboard/
│   ├── api.ts
│   └── queries.ts
└── reports/
    ├── api.ts
    └── queries.ts
```

Pages never call the API client directly — they always go through feature hooks.

### Cache invalidation

When an order is created or its status is updated, TanStack Query invalidates:
- `["orders"]` — refreshes the orders list
- `["dashboard"]` — refreshes dashboard metrics
- `["reports"]` — refreshes reports data

This ensures all pages show fresh data immediately after any mutation.

### Route protection

`<ProtectedRoute>` wraps all authenticated pages. It reads from `useAuthStore` — if no token is present, it redirects to `/login`.

---

## Key Decisions

- **TanStack Query over Redux/Context** — purpose-built for server state with caching, deduplication, and background refetching built in
- **Zustand over Redux** — minimal boilerplate for the small amount of client state needed
- **shadcn/ui** — unstyled accessible components that integrate cleanly with Tailwind without fighting the design
- **Offset pagination** — simple page/page_size pattern, consistent with the backend implementation
- **Search debounce** — 300ms debounce on the search input prevents excessive API calls while typing
- **Optimistic status updates** — `setQueryData` immediately updates the order detail cache before the server response, then invalidates to confirm

---

## Project Structure

```
src/
├── components/
│   ├── layout/       — AppLayout, Sidebar, Navbar, Footer, Header
│   ├── shared/       — PageHeader, StatusBadge, LoadingSpinner
│   └── ui/           — shadcn/ui primitives
├── features/         — domain modules (api, queries, mutations)
├── hooks/            — useDebounce, usePagination, useMobile, useInView
├── lib/              — api-client, query-client, utils, constants
├── pages/            — one file per route
├── providers/        — QueryClientProvider + Toaster
├── routes/           — route definitions and ProtectedRoute
├── stores/           — useAuthStore, useThemeStore, useRecentOrdersStore
└── types/            — TypeScript interfaces
```

---

## Assumptions & Trade-offs

- Single admin user — no multi-user support needed per assessment scope
- No mock/offline mode — the app requires the backend to be running
- Date range filter uses plain date inputs — preset shortcuts (Last 7 days, This month, etc.) were considered but plain inputs cover the full use case with less complexity
- `refetchOnWindowFocus` is disabled — avoids unexpected refetches when switching between browser tabs during development

## What I'd Improve With More Time

- Add date range preset shortcuts (Today / Last 7 days / This month / etc.)
- Add export to CSV on the orders page
- Add order search by order ID
- Add real-time updates via WebSocket or polling for order status changes
- Add error boundary components for graceful error handling per section
- Add E2E tests with Playwright covering the core order lifecycle

