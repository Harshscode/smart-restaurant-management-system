# Copper & Thyme — Smart Restaurant Management System

Copper & Thyme is a full-stack MERN restaurant management system for the SODV2201 final project. React communicates with an Express REST API, and all permanent restaurant records are stored in MongoDB. Browser storage is used only for the temporary shopping cart.

## Implemented functionality

### Customers

- Browse the current MongoDB menu with search, category, dietary, price, and availability filters
- Use the rule-based concierge with the current database menu
- Register, log in, restore a secure cookie session, update a profile, and deactivate an account
- Add dishes to a temporary cart and place pickup or delivery orders
- Track an order by its server-generated reference and checkout email
- View account order history, change quantities while an order is still Placed, and cancel eligible orders
- Submit table reservations and event requests
- View, edit, and cancel eligible reservations and events from the account page

### Administrators

- Log in through the protected admin portal
- View MongoDB-backed dashboard totals, revenue, recent activity, popular dishes, and seven-day order counts
- Create, update, delete, and change availability for menu items
- Review orders and apply only valid status transitions
- Review, confirm, and cancel reservations and event requests
- Create, view, edit, deactivate, and reactivate user accounts

The backend calculates prices and totals, validates all writes, enforces ownership and roles, hashes passwords, and uses an HttpOnly authentication cookie.

## Technology

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Validation | Zod |
| Authentication | JWT in HttpOnly cookie, bcryptjs |
| Security | Helmet, CORS, rate limiting, role authorization |
| Testing | Vitest |

## Project structure

```text
smart-restaurant-management-system/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/customer/
│   │   ├── pages/admin/
│   │   ├── services/
│   │   └── tests/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── scripts/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Local setup

Requirements:

- Node.js 20.19 or newer
- npm
- MongoDB 7 or 8, either locally or in Docker

### 1. Start MongoDB

The existing Docker setup can be used. A simple standalone alternative is:

```powershell
docker run -d --name srms-mongodb -p 127.0.0.1:27017:27017 -v srms-mongo-data:/data/db mongo:8
```

If the container already exists:

```powershell
docker start srms-mongodb
```

Do not delete the database volume unless you intend to remove stored records.

### 2. Configure and start Express

```powershell
cd server
Copy-Item .env.example .env
npm install
```

Edit `server/.env` and provide a strong `JWT_SECRET` and seed administrator password. The default database URI is:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/copper_thyme_srms
```

Seed initial menu/table data and the administrator, then start the API:

```powershell
npm run seed
npm run seed:admin
npm run dev
```

The API runs at `http://localhost:4000`. Verify `http://localhost:4000/api/health`.

### 3. Start React

In another terminal:

```powershell
cd client
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to Express on port 4000.

Never commit `.env`, database credentials, JWT secrets, or passwords. Keep both supplied `.env.example` files in the repository.

## Main API routes

| Area | Routes |
|---|---|
| Authentication | `/api/auth/register`, `/login`, `/logout`, `/me` |
| Users | `/api/users/me`, administrator `/api/users` CRUD |
| Menu | `/api/menu` and `/api/menu/:id` |
| Orders | `/api/orders`, `/track`, `/mine`, item/cancel/status routes |
| Reservations | `/api/reservations`, `/lookup`, `/mine`, update/cancel/status routes |
| Events | `/api/events`, `/lookup`, `/mine`, update/cancel/status routes |
| Dashboard | `/api/admin/dashboard` |

Administrator endpoints require an authenticated administrator. Customer history and mutation endpoints require the owning customer session.

## Verification

Frontend checks:

```powershell
cd client
npm test
npm run build
```

Recommended manual end-to-end checklist:

1. Register a customer, refresh the browser, log out, and log back in.
2. Place an order and confirm its reference, total, account history, and tracking lookup.
3. Change quantities or cancel while the order is Placed.
4. Submit a reservation and event request, then edit/cancel from the account page.
5. Log in as administrator and verify all new records appear.
6. Change order, reservation, and event statuses and confirm the customer sees the new state.
7. Create/edit/deactivate/reactivate a user and perform menu CRUD.
8. Refresh the dashboard and confirm its totals match the database activity.
9. Confirm customer accounts cannot enter `/admin` and guests cannot open `/account`.

Useful MongoDB check:

```javascript
use copper_thyme_srms
db.users.countDocuments({})
db.orders.countDocuments({})
db.reservations.countDocuments({})
db.events.countDocuments({})
```

Run Docker commands in PowerShell, not inside `mongosh`. Exit `mongosh` with `.exit` before running `docker inspect` or `docker exec`.

## Scope and limitations

- Payment processing is not included.
- Delivery dispatch is not included.
- Email and SMS notifications are not sent; references and in-app statuses are the confirmation mechanism.
- The concierge is intentionally rule-based and does not require a paid AI service.
- The cart remains browser-local until checkout; orders and every other permanent record use Express and MongoDB.
- This academic project is configured for local development and requires additional deployment hardening before public production use.

## Repository

[GitHub repository](https://github.com/Harshscode/smart-restaurant-management-system)

Course: SODV2201