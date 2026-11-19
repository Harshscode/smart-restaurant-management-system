# Frontend integration notes

The React application is now connected to the Express REST API. This file is retained only because it existed in the original frontend submission.

Permanent data no longer uses browser-local demonstration records:

- Menu data comes from `/api/menu`.
- Orders are created, tracked, updated, and listed through `/api/orders`.
- Reservations and events use their Express API modules.
- Customer and administrator authentication uses the HttpOnly backend session cookie.
- Administrator users and dashboard data come from MongoDB-backed endpoints.

Only the shopping cart remains in browser storage before checkout. At checkout, the client sends menu item IDs and quantities; the server validates availability and calculates authoritative totals.

Run the frontend with the API and MongoDB available:

```powershell
cd client
npm ci
npm run dev
```

Run the existing checks and production build with:

```powershell
npm test
npm run build
```

See the repository `README.md` for full local setup and verification instructions.