
# Copper & Thyme — Smart Restaurant Management System (SRMS)

A fullstack Smart Restaurant Management System developed for the **SODV2201 Final Project**.

The project uses React for the frontend, Node.js and Express.js for the backend, and MongoDB for database storage.

MongoDB can be run in either of two ways:

1. **Docker Desktop (Recommended)** — Run MongoDB inside a Docker container.
2. **MongoDB Community Server (Alternative)** — Install and run MongoDB directly on your computer.

Both methods use the same backend code and database connection string.

---

## 1. Project Overview

Copper & Thyme is a restaurant management application designed to simplify customer interactions and restaurant administration.

The system provides customer-facing restaurant interfaces, online ordering, table reservations, event enquiries, menu recommendations, and administrative management tools.

### Customer Features

- Restaurant homepage and navigation
- Menu browsing with categories, descriptions and prices
- Menu search and dietary filtering
- Shopping cart and quantity management
- Pickup and delivery order options
- Simulated checkout and order tracking
- Table reservation forms
- Special event booking enquiries
- Customer profile interface
- Rule-based AI menu assistant

### Administrator Features

- Administrator dashboard
- Menu item management
- Order management and status updates
- Reservation management
- Special event management
- User account management
- Restaurant activity statistics

**Development status:** The frontend interfaces and core backend APIs are implemented. Frontend-backend integration and final end-to-end testing are still in progress.

---

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Frontend Build Tool | Vite |
| Programming Language | JavaScript |
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| Database Modelling | Mongoose |
| Database Environment | Docker or Local MongoDB |
| Authentication API | JWT and HttpOnly Cookies |
| Password Hashing | bcryptjs |
| Input Validation | Zod |
| Security | Helmet, CORS, Rate Limiting |
| API Architecture | RESTful APIs |
| Frontend Testing | Vitest |
| Version Control | Git and GitHub |

### Application Architecture

```text
       React + Vite Frontend
        localhost:5173
               |
               | HTTP / REST API
               v
       Node.js + Express API
        localhost:4000
               |
               | Mongoose
               v
          MongoDB Database
        localhost:27017
               |
       Docker OR Local Install
```

Docker is only used to run the MongoDB database in the recommended setup.

React and Express run directly on the developer's machine.

---

## 3. Project Folder Structure

```text
smart-restaurant-management-system/
|
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- data/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- pages/
|   |   |   |-- customer/
|   |   |   `-- admin/
|   |   |-- services/
|   |   |-- styles/
|   |   `-- tests/
|   |-- package.json
|   `-- vite.config.js
|
|-- server/
|   |-- scripts/
|   |   |-- seed.js
|   |   `-- seedAdmin.js
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- lib/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- schemas/
|   |   |-- services/
|   |   |-- app.js
|   |   `-- index.js
|   |-- .env.example
|   `-- package.json
|
|-- .gitignore
`-- README.md
```

---

## 4. Prerequisites

Before running the project, make sure the following software is installed.

| Software | Requirement |
|---|---|
| Git | Required |
| Node.js | Version 22 or newer |
| npm | Required; included with Node.js |
| Visual Studio Code | Recommended |
| MongoDB | Docker image OR Community Server |
| MongoDB Compass | Optional |

### Check Installed Software

Open PowerShell or a terminal.

```powershell
git --version
node --version
npm --version
```

If using Docker, also check:

```powershell
docker --version
```

**Important:** You only need one MongoDB installation method. You do not need both Docker MongoDB and locally installed MongoDB.

---

## 5. Clone the GitHub Repository

Open PowerShell or a terminal in the directory where you want to download the project.

Run:

```bash
git clone https://github.com/Harshscode/smart-restaurant-management-system.git
```

Move into the project directory:

```bash
cd smart-restaurant-management-system
```

Verify that the project was cloned:

```bash
git status
```

The repository contains two main application directories:

- `client/` — React frontend
- `server/` — Express backend

Both applications must be started separately during local development.

---

# 6. MongoDB Database Setup

This project supports two ways to run MongoDB.

## Option A — MongoDB Using Docker (Recommended)

**Recommended for developers who already have Docker Desktop installed.**

Docker runs MongoDB inside an isolated container.

### Advantages

- No separate MongoDB server installation
- Consistent database environment
- Easy to start, stop and restart
- Persistent storage with Docker volumes
- Convenient for group projects
- Works with the existing Express/Mongoose backend

### Step A1 — Install Docker Desktop

Download and install Docker Desktop:

https://www.docker.com/products/docker-desktop/

Start Docker Desktop and ensure the Docker engine is running.

### Step A2 — Download the MongoDB Docker Image

Open PowerShell and run:

```powershell
docker pull mongo:8
```

This downloads the official MongoDB image.

### Step A3 — Create the MongoDB Container

Run:

```powershell
docker run -d --name srms-mongodb -p 127.0.0.1:27017:27017 -v srms-mongo-data:/data/db mongo:8
```

This command:

- Creates a container named `srms-mongodb`
- Runs MongoDB on port `27017`
- Makes MongoDB accessible from the local machine
- Creates a persistent Docker volume
- Runs MongoDB in the background

The `127.0.0.1` binding restricts database access to the local computer.

**Note:** This configuration is intended for local development. Authentication and additional security controls are required before exposing a database to other machines.

### Step A4 — Start an Existing Container

If the container already exists, do not create it again.

Use:

```powershell
docker start srms-mongodb
```

If another MongoDB container is already using port `27017`, reuse that instance or stop it before creating a new container.

### Step A5 — Verify MongoDB

Check running containers:

```powershell
docker ps
```

Test the database connection:

```powershell
docker exec srms-mongodb mongosh --eval "db.adminCommand({ ping: 1 })"
```

A successful response includes:

```text
ok: 1
```

### Step A6 — MongoDB Connection String

Your backend will connect using:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/copper_thyme_srms
```

No changes to Mongoose models or database connection code are necessary.

### Useful Docker Commands

Start MongoDB:

```powershell
docker start srms-mongodb
```

Stop MongoDB:

```powershell
docker stop srms-mongodb
```

Restart MongoDB:

```powershell
docker restart srms-mongodb
```

View MongoDB logs:

```powershell
docker logs srms-mongodb
```

View running containers:

```powershell
docker ps
```

**Data persistence:** The `srms-mongo-data` Docker volume preserves database records across ordinary container stops and restarts.

Do not delete the volume unless you intentionally want to remove the stored database data.

---

## Option B — MongoDB Community Server (Local Installation)

**Alternative for developers who prefer running MongoDB directly on their computer without Docker.**

### Advantages

- No Docker Desktop required
- MongoDB runs as a native system process/service
- Works with the same Express/Mongoose code
- Suitable for local development

### Step B1 — Install MongoDB Community Server

Download MongoDB Community Server:

https://www.mongodb.com/try/download/community

Choose the installation package for your operating system.

Follow the official installation instructions.

For Windows, you can install MongoDB as a Windows service.

### Step B2 — Start MongoDB

**Windows PowerShell**

Check the service:

```powershell
Get-Service MongoDB
```

If MongoDB is installed as a Windows service but is stopped, run PowerShell as Administrator and execute:

```powershell
Start-Service MongoDB
```

If the service is already running, no action is needed.

If the service is not found, check whether MongoDB was installed as a service or follow the MongoDB installation guide for starting `mongod` manually.

**Linux (systemd installations)**

```bash
sudo systemctl start mongod
```

**macOS**

Start MongoDB using the service command documented for the installation method you selected.

### Step B3 — Verify MongoDB

If MongoDB Shell (`mongosh`) is installed, run:

```bash
mongosh "mongodb://127.0.0.1:27017" --eval "db.adminCommand({ ping: 1 })"
```

A successful response includes:

```text
ok: 1
```

MongoDB Compass can also be used to verify the connection.

### Step B4 — MongoDB Connection String

For a default local MongoDB installation without authentication, use:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/copper_thyme_srms
```

This is exactly the same connection string used for the recommended Docker setup.

If your local MongoDB installation requires authentication or uses a different port, update the connection string accordingly.

---

## 7. Database Setup Comparison

| Feature | Docker MongoDB | Local MongoDB |
|---|---|---|
| MongoDB Community Server | Yes | Yes |
| Requires Docker Desktop | Yes | No |
| Requires local MongoDB installation | No | Yes |
| Supports Mongoose | Yes | Yes |
| Persistent database storage | Yes | Yes |
| Same backend source code | Yes | Yes |
| Same default connection string | Yes | Yes |
| Recommended approach | Yes | Alternative |

**Recommendation:** Use Docker if Docker Desktop is already installed and running. Otherwise, a native MongoDB Community Server installation is a valid alternative.

Complete either Option A or Option B before continuing.

---

# 8. Backend Configuration

After MongoDB is running, configure the Express backend.

### Step 1 — Create the Environment File

From the project root, run:

**Windows PowerShell**

```powershell
Copy-Item .\server\.env.example .\server\.env
```

**macOS/Linux**

```bash
cp server/.env.example server/.env
```

Open `server/.env` in your code editor.

### Step 2 — Configure Environment Variables

The environment file should contain the following settings:

```dotenv
PORT=4000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/copper_thyme_srms

JWT_SECRET=REPLACE_WITH_A_SECURE_RANDOM_SECRET

CLIENT_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

RESTAURANT_TIME_ZONE=America/New_York

SEED_ADMIN_EMAIL=admin@copperandthyme.demo
SEED_ADMIN_PASSWORD=REPLACE_WITH_YOUR_STRONG_PASSWORD
```

Replace the placeholder values before running the backend.

### Step 3 — Generate a JWT Secret

Run:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Copy the generated value into `JWT_SECRET`.

Choose a strong administrator password of at least 12 characters for `SEED_ADMIN_PASSWORD`.

**Security:** Do not commit `server/.env`, passwords, JWT secrets or other credentials to GitHub.

The repository's `.gitignore` excludes `.env` files.

---

# 9. Install Backend Dependencies

Open Terminal 1.

From the project root:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

The backend uses Express, Mongoose, Zod, JWT, bcryptjs, Helmet, CORS and other supporting packages.

---

## 10. Seed the MongoDB Database

The project includes scripts for adding initial restaurant data and creating an administrator account.

Make sure MongoDB is running.

From `server/`, run:

```bash
npm run seed
```

This seeds the initial restaurant menu and table configuration.

Next, create the administrator account:

```bash
npm run seed:admin
```

The administrator's email and password come from `server/.env`.

These two commands are separate.

Running the admin seed again will not automatically change the password of an account that already exists.

---

## 11. Run the Backend Server

From the `server/` directory:

```bash
npm run dev
```

The Express API runs on:

http://localhost:4000

### Verify Backend Health

Open:

http://localhost:4000/api/health

Expected response:

```json
{
  "status": "ok",
  "service": "copper-thyme-api"
}
```

### Verify Restaurant Menu API

Open:

http://localhost:4000/api/menu

The endpoint should return menu data stored in MongoDB.

If the endpoint returns an empty array, verify that the database seed completed successfully.

Keep the backend terminal running while using the application.

---

# 12. Install and Run the React Frontend

Open a second terminal.

Navigate to the project root and enter the `client` directory:

```bash
cd client
```

Install frontend dependencies:

```bash
npm ci
```

Start the React development server:

```bash
npm run dev
```

The frontend runs at:

http://localhost:5173

Open this address in your browser to view the Copper & Thyme restaurant website.

### Development Ports

| Service | Address |
|---|---|
| React Frontend | http://localhost:5173 |
| Express Backend | http://localhost:4000 |
| MongoDB | mongodb://127.0.0.1:27017 |
| Health API | http://localhost:4000/api/health |
| Menu API | http://localhost:4000/api/menu |

The Vite configuration forwards requests beginning with `/api` to the Express backend during development.

**Current limitation:** The existing frontend service layer still uses browser-local demonstration data. Its full integration with the Express APIs is a separate development stage.

---

# 13. Backend API Modules

The backend currently includes the following modules:

### Authentication

Base route:

```text
/api/auth
```

Provides registration, login, logout and authenticated account checks.

### User Management

Base route:

```text
/api/users
```

Supports customer profiles and administrator user management.

### Menu Management

Base route:

```text
/api/menu
```

Supports menu retrieval and administrator CRUD operations.

### Order Management

Base route:

```text
/api/orders
```

Supports order placement, tracking, customer order history and administrator status management.

### Reservation Management

Base route:

```text
/api/reservations
```

Supports table booking, viewing, updating, cancellation and reservation status management.

The backend also includes table allocation and overlapping-slot protection logic.

### Event Management

Base route:

```text
/api/events
```

Supports event enquiries and administrative event management.

### Admin Dashboard

Endpoint:

```text
/api/admin/dashboard
```

Provides MongoDB-backed restaurant dashboard statistics for authenticated administrators.

Restricted endpoints require appropriate authentication and authorization.

---

# 14. AI Menu Assistant

The React frontend includes a locally simulated menu assistant.

Features include:

- Popular dish recommendations
- Vegetarian and vegan options
- Gluten-free menu filtering
- Spicy food recommendations
- Budget-based suggestions
- Menu ingredient and allergen information
- Restaurant-related FAQs

The assistant currently uses rule-based recommendation logic.

It does not require a paid AI service.

A future integration stage can synchronize recommendations with the backend's current menu data.

---

# 15. Testing and Verification

### Frontend Tests

Open a terminal in `client/`.

Run:

```bash
npm run test
```

Build the frontend:

```bash
npm run build
```

Both commands should complete successfully.

### Backend Verification

Make sure MongoDB is running and the backend has started successfully.

Verify:

- `/api/health` returns a successful response
- `/api/menu` returns seeded database records
- Registration and login endpoints work
- Protected endpoints reject unauthorized access
- Administrator endpoints enforce role restrictions
- Order creation stores records in MongoDB
- Reservations enforce booking validation
- Events can be saved and retrieved
- Admin dashboard returns database-backed statistics

Automated backend API tests and complete frontend-backend integration tests still need to be added and verified.

---

# 16. Troubleshooting

### MongoDB Connection Refused

Error:

```text
ECONNREFUSED 127.0.0.1:27017
```

Possible solution:

- Start the Docker MongoDB container, or
- Start the local MongoDB service
- Check that port `27017` is available
- Check the `MONGODB_URI` in `server/.env`

### Docker Container Already Exists

If Docker reports that `srms-mongodb` already exists:

```powershell
docker start srms-mongodb
```

Do not run `docker run` again with the same container name.

### Port 27017 Already in Use

Another MongoDB instance may already be running.

Use only one database service on the default port or configure an alternative port and update `MONGODB_URI`.

### JWT Secret Missing

If the backend reports:

```text
Configure a secure JWT_SECRET in server/.env.
```

Generate and configure a secure JWT secret.

### Backend Cannot Find Dependencies

From `server/`:

```bash
npm install
```

### Frontend Cannot Find Dependencies

From `client/`:

```bash
npm ci
```

### Port 4000 Already in Use

Stop the existing process using port `4000`, or update the backend port and Vite proxy configuration consistently.

### Frontend Works but Shows Demo Data

The React frontend currently uses browser-local data services.

This does not necessarily mean MongoDB is failing. The frontend-backend integration phase must replace those local services with HTTP API requests.

### Administrator Login Difference

The backend seed script creates a real administrator account in MongoDB.

The current React administrator login remains a frontend demonstration. It is not yet connected to the backend authentication API.

---

# 17. GitHub Development Workflow

This project uses feature branches and pull requests.

The development history includes:

- Frontend initialization
- Homepage and About page
- Customer and admin interfaces
- Backend server setup
- MongoDB database models
- Database seed scripts
- Authentication and authorization
- Menu management API
- User management API
- Order management API
- Reservation and event APIs
- Admin dashboard API

Further development will include frontend-backend integration, automated backend testing and final verification.

Use meaningful Git commits and pull requests to document development progress.

---

# 18. Current Project Status

| Component | Status |
|---|---|
| React Frontend | Implemented |
| Express Backend | Implemented |
| MongoDB Models | Implemented |
| Database Seeding | Implemented |
| Authentication API | Implemented |
| Menu and User APIs | Implemented |
| Order API | Implemented |
| Reservation and Event APIs | Implemented |
| Admin Dashboard API | Implemented |
| Simulated Menu Assistant | Implemented in frontend |
| Frontend-Backend Integration | Pending |
| Real Frontend Authentication | Pending |
| Backend Automated Tests | Pending |
| End-to-End Testing | Pending |

The complete application is not yet ready for final submission until integration, testing and demonstration requirements are satisfied.

---

# 19. Project Limitations

- Payment processing is simulated.
- Delivery logistics are simulated.
- Email and SMS notifications are not implemented.
- AI recommendations currently use local rule-based logic.
- Frontend restaurant data is currently stored locally for demonstration.
- The frontend has not yet been fully connected to MongoDB-backed APIs.
- Additional testing and deployment hardening are required before production use.

These limitations reflect the current development stage and the academic scope of the project.

---

# 20. Future Development

Planned improvements include:

1. Integrating React with Express REST APIs
2. Connecting customer and administrator authentication
3. Synchronizing all restaurant data with MongoDB
4. Verifying complete ordering and reservation workflows
5. Adding automated backend and integration tests
6. Improving application error handling and documentation
7. Completing the final project video demonstration

---

## Repository

**GitHub:** https://github.com/Harshscode/smart-restaurant-management-system

**Project:** Copper & Thyme — Smart Restaurant Management System

**Course:** SODV2201

**Technology:** MERN Stack (MongoDB, Express.js, React, Node.js)

---

## License

This project is developed for educational and academic purposes.
