# AmazonClone — Full-Stack eCommerce Platform

A full-stack Amazon-like eCommerce application with Buyer, Seller, and Super Admin modules.  
Built with React, Node.js, Express, PostgreSQL, and Sequelize.

---

## Prerequisites

- Node.js 20.x LTS
- PostgreSQL 15.x running locally
- npm 10.x
- Git

---

## Project Structure

```
amazonclone/
├── backend/               # Express API
│   ├── controllers/       # Request/response handlers
│   ├── services/          # Business logic
│   ├── models/            # Sequelize models
│   ├── routes/            # Route definitions
│   ├── middlewares/       # Auth, role checks, error handling
│   ├── migrations/        # DB migrations
│   ├── seeders/           # Sample data
│   └── tests/             # Jest + supertest integration tests
├── frontend/              # React 18 + Vite app
│   └── src/
│       ├── api/           # Axios instance
│       ├── components/    # Reusable UI components
│       ├── context/       # AuthContext, CartContext
│       ├── pages/
│       │   ├── admin/     # Admin module pages
│       │   └── seller/    # Seller module pages
│       └── hooks/         # Custom hooks
├── docs/                  # Architecture, API reference, design docs
├── CLAUDE.md
└── README.md
```

---

## Setup & Run

### 1. Clone the repository
```bash
git clone https://github.com/psspl-harshptl/Amazon_Clone.git
cd amazonclone
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your database credentials:
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amazonclone_db
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Run migrations and seed data:
```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

Start the backend:
```bash
npm run dev
# Server running at http://localhost:5000
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the frontend:
```bash
npm run dev
# App running at http://localhost:5173
```

---

## Test Credentials (after seeding)

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Buyer | buyer@test.com | Test@1234 | `/` — browse, cart, orders |
| Seller | seller@test.com | Test@1234 | `/seller/dashboard` — manage listings |
| Super Admin | admin@test.com | Test@1234 | `/admin/dashboard` — approve sellers & products |

> The super admin account is created via seeder — do not register via the public form.

---

## Available Scripts

### Backend
| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | nodemon server.js | Dev server with auto-reload |
| `npm start` | node server.js | Production start |
| `npm test` | jest --forceExit --runInBand | Run integration test suite |
| `npm run migrate` | sequelize-cli db:migrate | Run pending migrations |
| `npm run seed` | sequelize-cli db:seed:all | Insert sample data |
| `npm run migrate:undo` | sequelize-cli db:migrate:undo | Rollback last migration |

### Frontend
| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | vite | Dev server |
| `npm run build` | vite build | Production build |
| `npm run preview` | vite preview | Preview production build |

---

## Features Implemented

### Buyer Module
- [x] Register / Login with JWT
- [x] Protected routes (frontend + backend)
- [x] Server-side JWT validation on app mount
- [x] 401 auto-logout on expired/tampered token
- [x] Product listing with pagination, search, filters
- [x] Product detail with image gallery
- [x] Cart (add, update quantity, remove, clear)
- [x] Checkout with shipping address
- [x] Order placement via DB transaction (price integrity enforced server-side)
- [x] Order history and detail view
- [x] Recently viewed products

### Seller Module
- [x] Seller registration (account starts as `pending`, requires admin approval)
- [x] Seller login (blocked until approved)
- [x] Dashboard with listing stats (total, pending, approved, rejected)
- [x] Create / edit / delete own product listings
- [x] Product status visibility (pending/approved/rejected with rejection reason)
- [x] Multi-image upload support

### Super Admin Module
- [x] Admin login (super_admin role only)
- [x] Dashboard with platform-wide stats (products + sellers by status)
- [x] Top viewed products analytics
- [x] Product approval / rejection (with rejection reason)
- [x] Seller approval / rejection (with optional rejection reason)
- [x] Full product management (edit, delete any product)

---

## Roles & Access

| Role | Registration | Login Redirect | Capabilities |
|------|--------------|----------------|--------------|
| `buyer` | `/register` | `/` | Browse products, cart, orders |
| `seller` | `/seller/register` (pending → admin approves) | `/seller/dashboard` | Manage own listings |
| `super_admin` | Seeded in DB | `/admin/dashboard` | Approve sellers & products, platform analytics |

---

## Testing

Integration tests use **Jest** + **supertest** and run against the real local database.

```bash
cd backend
npm test
```

| Test file | What it covers |
|-----------|---------------|
| `tests/auth.test.js` | Register (success, duplicate, missing fields), Login (success, wrong password, unknown email), protected route guard |
| `tests/cart.test.js` | Full cart lifecycle — empty cart, add item, quantity upsert, fetch with product data, update quantity, qty=0 auto-removes, delete item, 404 on re-delete, clear cart |

> Tests create and clean up their own isolated DB records — safe to run against your dev database.

---

## API Documentation

See `docs/api.md` for the complete endpoint reference with request/response examples.

---

## Git Commit Convention

```
feat: add seller dashboard API
fix: resolve JWT expiry handling
refactor: extract order logic to service layer
chore: add migration for seller fields
style: fix product card hover animation
docs: update README with seller module
```

---

## Documentation Files

| File | Description |
|------|-------------|
| `CLAUDE.md` | Claude Code configuration and project rules |
| `docs/architecture.md` | System architecture, folder structure, DB schema |
| `docs/components.md` | All React components with props and design specs |
| `docs/pages.md` | All pages with layout, sections, routes |
| `docs/state.md` | State management, contexts, local state shapes |
| `docs/tech_stack.md` | Tech versions, setup code, npm packages |
| `docs/api.md` | Complete REST API reference |
| `docs/design_tokens.md` | Colors, typography, spacing |

---

## Security Notes

- Passwords hashed with bcrypt (saltRounds: 12)
- JWT stored in localStorage (httpOnly cookie recommended for production)
- All private routes protected on both frontend and backend
- Role-based access control: `requireRole` and `requireApprovedSeller` middleware
- `priceAtPurchase` fetched from DB server-side — client cannot manipulate order price
- No secrets committed — use `.env` only
- Stack traces hidden in production responses

---

## License

MIT
