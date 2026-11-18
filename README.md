
# Copper & Thyme — Smart Restaurant Management System

## Project Overview

Copper & Thyme is a Smart Restaurant Management System developed for the SODV2201 Final Project.

The system includes customer-facing restaurant pages, menu browsing, ordering, table reservations, private event enquiries, a simulated AI menu assistant, and an administrative dashboard.

The repository contains both the React frontend and a Node.js/Express backend using MongoDB.

## Current Development Status

### Frontend
- React customer and admin interfaces implemented
- Restaurant menu with search and filtering
- Shopping cart and simulated checkout
- Order tracking, reservations and event enquiries
- Customer account preview and admin dashboard
- Locally simulated AI menu assistant
- Frontend tests included

The frontend currently uses browser-local demo data and simulated authentication.

### Backend
- Express API and MongoDB connection implemented
- Mongoose database schemas and seed scripts
- Authentication and role-based authorization endpoints
- User and menu management CRUD APIs
- Order management API
- Reservation and event management APIs
- Admin dashboard API

### Remaining Work
- Connect React to the Express REST APIs
- Replace demo authentication with backend sessions
- Verify complete MongoDB-backed workflows
- Add and run backend API tests
- Complete final integration and submission testing

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Database Environment | Docker Desktop |
| Authentication | JWT, HttpOnly cookies |
| Password Hashing | bcryptjs |
| Validation | Zod |
| Security | Helmet, CORS, rate limiting |
| Frontend Testing | Vitest |

## Project Structure

```text
smart-restaurant-management-system/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   └── tests/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── scripts/
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

Before running the project, install:

- Git
- Node.js 22 or newer
- npm
- Docker Desktop
- Visual Studio Code (recommended)

## Installation and Local Setup

### 1. Clone the Repository

```powershell
git clone https://github.com/Harshscode/smart-restaurant-management-system.git
cd smart-restaurant-management-system
```

### 2. Start MongoDB in Docker

Make sure Docker Desktop is running.

If you do not already have a MongoDB container:

```powershell
docker pull mongo:8

docker run -d --name srms-mongodb -p 127.0.0.1:27017:27017 -v srms-mongo-data:/data/db mongo:8
```

If the container already exists:

```powershell
docker start srms-mongodb
```

Do not create a second container if another MongoDB instance is already using port 27017.

Verify the connection:

```powershell
docker exec srms-mongodb mongosh --eval "db.adminCommand({ ping: 1 })"
```

The response should include `ok: 1`.

### 3. Configure the Backend Environment

From the repository root:

```powershell
Copy-Item .\server\.env.example .\server\.env
```

Open `server/.env` and configure:

- `PORT=4000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/copper_thyme_srms`
- `JWT_SECRET` — replace with a secure random secret
- `SEED_ADMIN_EMAIL` — administrator email
- `SEED_ADMIN_PASSWORD` — strong administrator password

Generate a JWT secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Never commit `server/.env` or real credentials.

### 4. Install Backend Dependencies

Open Terminal 1:

```powershell
cd server
npm install
```

Seed restaurant menu items and tables:

```powershell
npm run seed
```

Create the administrator account:

```powershell
npm run seed:admin
```

### 5. Start the Backend

From `server/`:

```powershell
npm run dev
```

Verify these endpoints:

- Health: http://localhost:4000/api/health
- Restaurant menu: http://localhost:4000/api/menu

The backend must connect successfully to MongoDB before it starts listening.

### 6. Install Frontend Dependencies

Open Terminal 2 at the repository root:

```powershell
cd client
npm ci
```

### 7. Start the Frontend

From `client/`:

```powershell
npm run dev
```

Open:

http://localhost:5173

The frontend and backend run as separate development servers.

Note: The current React frontend uses local demo services. API integration is still in development.

## Testing

### Frontend Tests

From `client/`:

```powershell
npm run test
npm run build
```

### Backend Verification

From `server/`, with MongoDB running:

```powershell
npm run dev
```

Test the health endpoint and public menu endpoint.

Automated backend API tests have not yet been added to this repository.

## Backend API Modules

The Express backend provides API routes for:

- Authentication: `/api/auth`
- User management: `/api/users`
- Restaurant menu: `/api/menu`
- Orders: `/api/orders`
- Reservations: `/api/reservations`
- Events: `/api/events`
- Admin dashboard: `/api/admin/dashboard`

Protected routes require authentication and appropriate user permissions.

## Database

MongoDB runs locally in Docker.

The backend uses Mongoose models for users, menu items, orders, reservations, events, restaurant tables and table schedules.

Database data is preserved in a named Docker volume.

The local MongoDB container is intended only for development. It must not be exposed publicly without appropriate authentication and security configuration.

## AI Menu Assistant

The frontend includes a rule-based menu assistant supporting simulated recommendations based on categories, dietary preferences, spice levels and budget.

It does not require a paid AI API.

Backend integration and dynamic menu synchronization remain future work.

## GitHub Development Workflow

The project uses feature branches and pull requests.

Development has included:
- React/Vite project setup
- Homepage and About page
- Customer and admin interfaces
- Express backend setup
- Database models and seeding
- Authentication
- User and menu APIs
- Order management
- Reservation and event management
- Admin dashboard API

The final integration and testing work will be committed in additional branches.

## Project Limitations

- Payments are simulated.
- Delivery logistics are simulated.
- Frontend data services are not yet connected to MongoDB APIs.
- Frontend authentication is currently a demonstration.
- Email and SMS notifications are not implemented.
- The application has not yet completed end-to-end integration testing.

## Future Development

1. React and Express API integration
2. Secure frontend authentication integration
3. Complete database-backed customer/admin workflows
4. Automated backend and integration tests
5. Final documentation and demonstration

## Repository

https://github.com/Harshscode/smart-restaurant-management-system
