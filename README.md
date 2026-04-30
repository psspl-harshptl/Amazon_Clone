# AmazonClone — Buyer Module

A full-stack Amazon-like eCommerce application (Buyer Module only).  
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
├── backend/          # Express API
├── frontend/         # React + Vite app
├── CLAUDE.md
├── architecture.md
├── components.md
├── pages.md
├── state.md
├── tech_stack.md
├── api.md
├── design_tokens.md
└── README.md
```

---

## Setup & Run

### 1. Clone the repository
```bash
git clone https://github.com/yourname/amazonclone.git
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
CORS_ORIGIN=http://localhost:3000
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
# App running at http://localhost:3000
```

---

## Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Buyer | buyer@test.com | Test@1234 |

---

## Available Scripts

### Backend
| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | nodemon server.js | Dev server with auto-reload |
| `npm start` | node server.js | Production start |
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

### Authentication
- [x] Register with email, name, phone
- [x] Login with JWT
- [x] Protected routes (frontend + backend)
- [x] Persistent session via localStorage

### Products
- [x] Product listing with pagination
- [x] Search by keyword
- [x] Filter by category, price, rating, discount
- [x] Product detail with image gallery
- [x] Product specifications and reviews

### Cart
- [x] Add to cart
- [x] Update quantity
- [x] Remove item
- [x] Clear cart
- [x] Real-time cart count badge

### Orders
- [x] Place order (with shipping address)
- [x] Order history
- [x] Order detail view
- [x] Order success confirmation page

---

## API Documentation

See `api.md` for complete endpoint reference with request/response examples.

---

## Git Commit Convention

```
feat: add cart API endpoints
fix: resolve JWT expiry handling
refactor: extract order logic to service layer
chore: add migration for order_items table
style: fix product card hover animation
docs: update README setup instructions
```

---

## Documentation Files

| File | Description |
|------|-------------|
| `CLAUDE.md` | Claude Code configuration and rules |
| `architecture.md` | System architecture, folder structure, DB schema |
| `components.md` | All React components with props and design specs |
| `pages.md` | All pages with layout, sections, routes |
| `state.md` | State management, contexts, local state shapes |
| `tech_stack.md` | Tech versions, setup code, npm packages |
| `api.md` | Complete REST API reference |
| `design_tokens.md` | Colors, typography, spacing from Figma |

---

## Security Notes

- Passwords hashed with bcrypt (saltRounds: 12)
- JWT stored in localStorage (httpOnly cookie recommended for production)
- All private routes protected on both frontend and backend
- No secrets committed — use `.env` only
- Stack traces hidden in production responses

---

## License

MIT
