# architecture.md — AmazonClone Buyer Module

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                    │
│   React 18 + Vite + Tailwind CSS + React Router v6     │
│   AuthContext  │  CartContext  │  Axios Instance        │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP REST /api/v1/*
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js)                      │
│   Express.js + JWT Middleware + Error Middleware        │
│   Routes → Controllers → Services → Models             │
└────────────────────────┬────────────────────────────────┘
                         │ Sequelize ORM
                         ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL 15)                   │
│  users │ categories │ products │ carts │ cart_items     │
│  orders │ order_items                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Backend Architecture (MVC + Service Layer)

```
backend/
├── server.js                  # Entry point, starts Express server
├── app.js                     # Express app setup, middleware, routes mount
├── config/
│   └── database.js            # Sequelize connection (env-based)
├── migrations/                # All DB schema changes (never sync())
│   ├── 001-create-users.js
│   ├── 002-create-categories.js
│   ├── 003-create-products.js
│   ├── 004-create-carts.js
│   ├── 005-create-cart-items.js
│   ├── 006-create-orders.js
│   └── 007-create-order-items.js
├── seeders/
│   ├── 001-seed-categories.js
│   └── 002-seed-products.js
├── models/
│   ├── index.js               # Sequelize init + associations
│   ├── User.js
│   ├── Category.js
│   ├── Product.js
│   ├── Cart.js
│   ├── CartItem.js
│   ├── Order.js
│   └── OrderItem.js
├── routes/
│   ├── index.js               # Mounts all routers under /api/v1
│   ├── auth.routes.js
│   ├── product.routes.js
│   ├── cart.routes.js
│   └── order.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── product.controller.js
│   ├── cart.controller.js
│   └── order.controller.js
├── services/
│   ├── auth.service.js        # register, login, getMe logic
│   ├── product.service.js     # list, search, detail, categories
│   ├── cart.service.js        # get, add, update, remove, clear
│   └── order.service.js       # place (transaction), history, detail
├── middlewares/
│   ├── auth.middleware.js     # verifyToken — attaches req.user
│   ├── error.middleware.js    # global error handler, no stack in prod
│   └── validate.middleware.js # express-validator check runner
└── utils/
    ├── jwt.util.js            # signToken, verifyToken helpers
    ├── response.util.js       # success() and error() response wrappers
    └── logger.js              # morgan (dev) / winston (prod)
```

### Request Lifecycle
```
Request
  → app.js (CORS, JSON parse, morgan)
  → routes/index.js
  → auth.middleware.js (if protected)
  → validate.middleware.js (if body validation)
  → controller (req/res only, calls service)
  → service (business logic, calls model)
  → model (Sequelize query)
  → response.util (standard JSON wrapper)
  → error.middleware (catches any throw)
Response
```

---

## Frontend Architecture

```
frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── main.jsx               # ReactDOM.createRoot, wrap with providers
│   ├── App.jsx                # React Router routes definition
│   ├── api/
│   │   └── axios.js           # Axios instance + interceptors
│   ├── context/
│   │   ├── AuthContext.jsx    # user, token, login(), logout()
│   │   └── CartContext.jsx    # items, count, addItem(), removeItem(), updateQty()
│   ├── hooks/
│   │   ├── useAuth.js         # consumes AuthContext
│   │   └── useCart.js         # consumes CartContext
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── product/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── ProductFilters.jsx
│   │   │   ├── StarRating.jsx
│   │   │   └── ProductBadge.jsx
│   │   ├── cart/
│   │   │   ├── CartItem.jsx
│   │   │   └── OrderSummary.jsx
│   │   └── order/
│   │       └── OrderCard.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Home.jsx
│   │   ├── ProductList.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderHistory.jsx
│   │   ├── OrderDetail.jsx
│   │   └── OrderSuccess.jsx
│   └── utils/
│       ├── formatCurrency.js  # ₹ formatting with Intl
│       ├── formatDate.js
│       └── storage.js         # getToken, setToken, removeToken
```

### Data Flow
```
API call (axios.js)
  → AuthContext (token injected by interceptor)
  → Page component (fetches on mount via useEffect)
  → Child components receive data as props
  → User action → service call → context update → re-render
```

---

## Database Schema (ERD)

```
users
  id (PK) | name | email (UNIQUE) | password | phone
  address (JSONB) | role (default: buyer) | timestamps

categories
  id (PK) | name (UNIQUE) | slug | imageUrl | timestamps

products
  id (PK) | categoryId (FK→categories) | name | slug
  description | price (DECIMAL 10,2) | mrp (DECIMAL 10,2)
  stock (INT) | imageUrl | images (ARRAY) | badge
  rating (DECIMAL 3,2) | reviewCount | timestamps

carts
  id (PK) | userId (FK→users, UNIQUE) | timestamps

cart_items
  id (PK) | cartId (FK→carts) | productId (FK→products)
  quantity (INT, min:1) | timestamps
  UNIQUE (cartId, productId)

orders
  id (PK) | userId (FK→users) | totalAmount (DECIMAL 10,2)
  status (ENUM: pending|confirmed|shipped|delivered|cancelled)
  shippingAddress (JSONB) | paymentMethod | timestamps

order_items
  id (PK) | orderId (FK→orders) | productId (FK→products)
  quantity (INT) | priceAtPurchase (DECIMAL 10,2) | timestamps
```

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Passwords | bcrypt, saltRounds: 12 |
| Auth tokens | JWT, HS256, expires: 7d |
| Token storage | localStorage (frontend) |
| Protected routes | auth.middleware.js (backend) + ProtectedRoute.jsx (frontend) |
| Input validation | express-validator on all POST/PUT |
| Error exposure | Stack traces hidden in production |
| Secrets | .env only, never committed |
| CORS | Configured to CORS_ORIGIN only |

---

## Environment Strategy

```
.env.development   → local postgres, verbose logs, CORS localhost
.env.production    → cloud DB, silent logs, real CORS domain
.env.example       → committed to repo, no real values
```

---

## API Base URL Convention
```
/api/v1/auth/*       Public + Private
/api/v1/products/*   Public
/api/v1/categories/* Public
/api/v1/cart/*       Private (JWT required)
/api/v1/orders/*     Private (JWT required)
```
