# Copper & Thyme — Remaining Frontend (React only)

This archive is a **frontend-only overlay** intended for a Git worktree that
already has Stage 1-4 (`client/` with the existing Home and About pages).

## What this adds

- Restaurant menu, search/categories/dietary and price filtering, ingredient details
- Add-to-cart, quantity editing, cart persistence, pickup/delivery checkout
- Order reference tracking with a demo status flow
- Table reservations with basic capacity/time conflict rules
- Event enquiries and local status management
- Menu concierge with locally simulated recommendations (no external AI API)
- Admin login demonstration, dashboard, menu/order/reservation/event management
- Customer profile preview and local admin demo-profile listing
- Component/service tests and local-storage-based sample data

## What it does NOT include

- Any Node.js/Express/MongoDB/server code, Docker files, environment secrets, or passwords
- Real authentication, payments, email delivery, live reservations, or AI provider integration
- Cross-device shared data: only browser storage is used; storage can be cleared

All admin login validation is **frontend demo-only**. The credential shown in
the admin login interface is an illustrative account and is NOT secure auth.
Customer profiles similarly provide UI previews, not secure identities.

## Install into existing repository worktree

From the folder containing `client/`, extract the archive contents with
PowerShell `Expand-Archive -LiteralPath "<path-to-zip>" -DestinationPath "." -Force`.
This **overwrites** existing `client/src/App.jsx`, `client/src/main.jsx`,
`client/src/components/layout/SiteLayout.jsx`, and `client/src/pages/customer/Menu.jsx`
with a coherent frontend-only implementation. Make sure any local unpublished
edits to those files are saved elsewhere first.

It intentionally does **not** include/overwrite your staged Home, About,
`home.css`, `about.css`, `client/index.html` or `client/package.json`.

Install and check:

```powershell
cd client
npm install
npm run test
npm run build
npm run dev
```

Visit `/`, `/about`, `/menu`, `/cart`, `/checkout`, `/track`, `/reservations`,
`/events`, `/concierge`, `/account/login`, `/admin/login`.

For local demo staff access, see the credentials displayed on `/admin/login`.
Complete the test flows before committing. Never commit `node_modules`,
`dist`, `.env`, database/server files, or the extracted archive itself.

## Later backend integration

Replace `src/services/restaurantService.js` with API calls when the Express
and MongoDB backend stage begins; implement protected sessions and server-side
validation in that phase. The staged frontend is intentionally self-contained.
