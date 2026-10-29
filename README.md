# Copper & Thyme - Smart Restaurant Management System

Fullstack restaurant management project for SODV2201. The application provides
customer ordering, table reservations, private-event enquiries, a current-menu
concierge, and an operations dashboard. React consumes a Node.js/Express REST
API with MongoDB persistence and role-based authorization.

## What is included

- Customer website: home, categorized menu, search/filter, cart, pickup/delivery
  checkout, order tracking, booking forms, personal account, order history and in-app notifications.
- Operations website: secure staff login, menu CRUD, orders and status changes,
  reservations/events with approval/cancellation, registered account management.
- Node.js API: Express, Mongoose models, validation, server-calculated order
  totals, password hashing, signed HttpOnly-cookie sessions, permission checks.
- Reservation protection: atomic overlapping-slot claims for table/date using
  MongoDB, without requiring a local replica set.
- Tests, example data seeding, demonstration checklist and API documentation.

## Requirements

- Node.js 22 or newer (with npm).
- **MongoDB**: Community Server, Docker, or MongoDB Atlas.
- Internet access during initial `npm install` to download dependencies.
- Two open terminal windows for development, or the bundled launch command.

## Quick start - local Node.js + MongoDB

1. Make sure MongoDB is running and is reachable at the URI you intend to use.
2. From the repository root, create your configuration file:

   macOS/Linux:

   ```bash
   cp server/.env.example server/.env
   ```

   Windows PowerShell:

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

3. **Edit `server/.env` before continuing.** Set `MONGODB_URI` for your MongoDB
   server. Replace `JWT_SECRET` with a long random secret and replace
   `SEED_ADMIN_PASSWORD` with your desired staff password. Generate a secret:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   ```

4. Run from the repository root:

   ```bash
   npm install
   npm run seed
   npm run dev
   ```

5. Open **http://localhost:5173** for the React app. The API runs at
   **http://localhost:4000/api/health**. Vite automatically forwards `/api` to
   Express in development.

6. Open **Staff login** and use the credentials you specified for
   `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `server/.env`. They are only
   used to create an administrator during the initial seed; changing the env
   password later does NOT change a previously created account password.

### Optional sample orders and bookings

The normal seed creates the staff account and menu only, starting with empty
customer activity. To populate example orders, reservations and event enquiries:

```bash
npm run seed --workspace=server -- --demo
```

This operation preserves existing menu edits, staff passwords and records on
subsequent runs. The demo samples use test identities, not real customer data.

### Windows launchers

- `RUN_WINDOWS.bat`: creates config on first run, installs packages, seeds,
  then launches the API and React development server.
- `CHECK_WINDOWS.bat`: runs the test suites and production frontend build.

## Alternative - Docker Compose (complete web app + MongoDB)

Install Docker Desktop, then from the root:

```bash
cp server/.env.example server/.env
# Edit server/.env: replace secrets and staff password.
docker compose up -d --build
docker compose exec app npm run seed --workspace=server -- --demo
```

Open **http://localhost:4000**. In Docker, Express serves the compiled React
frontend from the same origin, and MongoDB runs inside the `db` container.

On Windows, create `server/.env` using the PowerShell command from the previous
section before invoking `docker compose`.

The Compose setup is intended for LOCAL demonstration over HTTP. For public
hosting, use HTTPS, real secrets, production cookies, a managed MongoDB and
appropriate deployment safeguards. Do not expose MongoDB directly online.

## Tests and verification

After `npm install`:

```bash
npm run test:server
npm run test:client
npm run build
node scripts/api-smoke.mjs
```

The smoke script needs a running, seeded API. Manual browser checks are listed
in `docs/TEST_AND_DEMO.md`. A successful build alone does not verify MongoDB,
login cookies, table booking concurrency or all browser workflows.

## Codebase

```text
client/
  src/pages/customer/       Home, menu, checkout, account, bookings, concierge
  src/pages/admin/          Staff dashboard, orders, menu, reservations, users
  src/components/           Shared layouts, menu cards and UI elements
  src/context/              Cart, notifications and session context
  src/services/             HTTP client + repository boundary
  src/lib/                  Formatting and form validation
  src/tests/                Frontend tests
server/
  src/models/               Mongoose documents and indexes
  src/routes/               REST endpoint handlers
  src/services/             Booking allocation, order pricing, menu answers
  src/schemas/              Zod request validation
  src/middleware/           Session access, request validation, error handling
  src/config/               Environment, Mongo connection, restaurant tables
  scripts/seed.js           Idempotent bootstrap and optional sample data
  tests/                    Dependency-free business logic tests
docs/                       Architecture, API reference, acceptance checks
scripts/                    Development launcher and smoke checks
compose.yaml                MongoDB + production-built React/Express container
Dockerfile                  Multi-stage image for app and frontend
```

## Development and GitHub workflow

Use ONE GitHub repository for all stages. Make meaningful commits as you work
and fix real issues; do not fabricate commits or claim work you did not do.
The instructor evaluates the implementation, code explanation, tests, debugging
and genuine development progress, in addition to demonstration videos.

## Scope and limitations

- Orders are stored in MongoDB; payments and delivery are simulated, as
  explicitly allowed by the project brief.
- Customer/guest bookings and events are recorded; confirmation status is shown
  on screen and in accounts. Email/SMS delivery is not included.
- Menu concierge is a deterministic recommendation implementation using live
  MongoDB menu data. It does not use a paid external service.
- Cart drafts are saved locally until checkout; final orders are persisted in
  MongoDB and totals recomputed server-side.
- Reservations use a two-hour table occupancy window; booking times end at 20:00
  in `RESTAURANT_TIME_ZONE`, which defaults to America/New_York.
- The system is suitable for a coursework demo and a scalable starting point.
  Public commercial operation would need deployment hardening, transactional
  booking orchestration, production monitoring and a real notification service.

See `docs/ARCHITECTURE.md`, `docs/API_REFERENCE.md`, and `docs/TEST_AND_DEMO.md`.
