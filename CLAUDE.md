# CLAUDE.md — eCommerce Buyer Module

## Commands
- `/pr-review` — runs PR diff review (see `.claude/commands/pr-review.md`)
- `/spec` — expand a vague feature idea into a structured spec before coding starts

## Stack
- **Frontend:** React 18, Tailwind CSS, Axios, React Router v6
- **Backend:** Node.js, Express.js
- **DB:** PostgreSQL 15, Sequelize ORM
- **Auth:** JWT (bcrypt saltRounds:12, NEVER plain-text passwords)

---

## Folder Structure
```
backend/  config/ migrations/ models/ routes/ controllers/ services/ middlewares/ utils/ seeders/
frontend/src/  api/ components/common/ components/product/ components/cart/ pages/ context/ hooks/ utils/
```

---

## Models & Fields
| Model | Key Fields |
|-------|-----------|
| User | id, name, email(unique), password(hashed), phone, address(JSONB), role(default:buyer) |
| Category | id, name(unique), slug, imageUrl |
| Product | id, categoryId(FK), name, slug, description, price(DECIMAL), stock, imageUrl, rating |
| Cart | id, userId(FK,unique) |
| CartItem | id, cartId(FK), productId(FK), quantity(min:1) |
| Order | id, userId(FK), totalAmount, status(ENUM:pending/confirmed/shipped/delivered/cancelled), shippingAddress(JSONB), paymentMethod |
| OrderItem | id, orderId(FK), productId(FK), quantity, priceAtPurchase(DECIMAL) |

---

## API Endpoints
```
POST   /api/v1/auth/register        Public  — register user
POST   /api/v1/auth/login           Public  — login, return JWT
GET    /api/v1/auth/me              Private — current user

GET    /api/v1/products             Public  — list (paginated)
GET    /api/v1/products/:id         Public  — detail
GET    /api/v1/products/search      Public  — search by keyword
GET    /api/v1/categories           Public  — list categories

GET    /api/v1/cart                 Private — get cart
POST   /api/v1/cart/items           Private — add item
PUT    /api/v1/cart/items/:itemId   Private — update quantity
DELETE /api/v1/cart/items/:itemId   Private — remove item
DELETE /api/v1/cart                 Private — clear cart

POST   /api/v1/orders               Private — place order (DB transaction)
GET    /api/v1/orders               Private — order history
GET    /api/v1/orders/:id           Private — order detail
```

---

## Backend Rules
- **MVC + Service Layer:** controllers handle req/res only; business logic in services
- **Always use migrations** — never `sequelize.sync()`
- All models must have Sequelize field validations
- Use DB **transactions** for order placement (copy priceAtPurchase)
- Global error middleware — never send stack traces to client
- Standard response wrapper: `{ success, data, message }` / `{ success, error, statusCode }`
- Validate all request bodies (express-validator or joi)
- Use `async/await` + `try/catch` everywhere — no callbacks

---

## Frontend Rules
- Functional components + hooks only
- **AuthContext** (JWT, user state) + **CartContext** (items, count)
- Axios instance in `src/api/axios.js` — JWT request interceptor + 401 auto-logout interceptor
- `<ProtectedRoute>` wraps all private pages

### Required Reusable Components
| Component | Responsibility |
|-----------|---------------|
| Navbar | Search bar, cart icon with badge, login/logout |
| ProductCard | Image, name, price, rating, Add to Cart |
| CartItem | Product info, quantity stepper, remove |
| Loader | Centered spinner |
| Toast | Success/error notifications |

### Pages
`Home, Login, Register, ProductList, ProductDetail, Cart, Checkout, OrderHistory, OrderDetail`

---

## UI Style
- Colors: header `#131921`, nav `#232F3E`, CTA/accent `#FF9900`, background `#fff`
- Cards: `rounded-xl shadow-md hover:shadow-lg transition`
- Mobile-first responsive (Tailwind grid/flex)
- Toast on every user action (add to cart, order placed, errors)

---

## Environment Variables
```
# backend .env
PORT=5000
DB_HOST=localhost, DB_PORT=5432, DB_NAME=ecommerce_db, DB_USER=postgres, DB_PASSWORD=
JWT_SECRET=32+char_secret, JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000

# frontend .env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## Git Commits
`feat:` `fix:` `refactor:` `chore:` `style:` `docs:` — meaningful messages only

## Setup
```bash
cd backend && npm i && npx sequelize-cli db:create && db:migrate && db:seed:all && npm run dev
cd frontend && npm i && npm run dev
```

## Hard Rules (never break)
- No plain-text passwords — bcrypt only
- No hardcoded secrets — .env only
- No sequelize.sync() — migrations only
- No stack traces to client
- No seller/admin features — Buyer Module only

---

## Response Style
- **Be concise** — no trailing summaries, no restating what was just done
- **Code first** — for implementation tasks, show code before explanations
- **No over-engineering** — implement exactly what was asked, nothing more
- **Clarify before coding** — if a requirement is ambiguous or touches auth/orders/payments, ask one focused question first
- **File references** — always link files as `[path](path#Lline)` so they are clickable
- **Errors** — explain root cause in one sentence, then show the fix; skip the backstory
- **Scope guard** — if the request would break a Hard Rule above, refuse and explain why in one line

