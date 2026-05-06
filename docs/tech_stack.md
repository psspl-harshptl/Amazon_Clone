# tech_stack.md — AmazonClone Technology Reference

## Overview

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend framework | React | 18.x | UI component model |
| Frontend build tool | Vite | 5.x | Fast dev server + bundler |
| CSS framework | Tailwind CSS | 3.x | Utility-first styling |
| Routing | React Router DOM | 6.x | Client-side navigation |
| HTTP client | Axios | 1.x | API calls + interceptors |
| Backend framework | Express.js | 4.x | REST API server |
| Runtime | Node.js | 20.x LTS | JavaScript server runtime |
| ORM | Sequelize | 6.x | PostgreSQL abstraction |
| Database | PostgreSQL | 15.x | Relational data store |
| Auth | jsonwebtoken | 9.x | JWT sign + verify |
| Password hashing | bcrypt | 5.x | Secure password storage |
| Validation | express-validator | 7.x | Request body validation |
| Environment | dotenv | 16.x | .env file loading |
| Dev server | nodemon | 3.x | Auto-restart on change |
| DB migrations CLI | sequelize-cli | 6.x | Migration + seeder runner |
| Logger | morgan | 1.x | HTTP request logging |

---

## Frontend Stack Detail

### React 18
- Use **functional components only** — no class components
- **Hooks used:** `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`, `useRef`
- **StrictMode** enabled in development

### Vite
```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'   // proxy API calls in dev
    }
  }
})
```

### Tailwind CSS
```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        amazon: {
          primary:   "#FF9900",   // accent / search button
          header:    "#131921",   // top navbar
          nav:       "#232F3E",   // secondary nav + footer
          btn:       "#FFD814",   // Add to Cart
          buy:       "#FFA41C",   // Buy Now
          link:      "#007185",   // text links
          text:      "#0F1111",   // body text
          muted:     "#565959",   // secondary text
          border:    "#DDD",      // card borders
          bg:        "#F3F3F3",   // page background
          red:       "#CC0C39",   // badges, errors
          green:     "#067D62",   // in stock, success
        }
      },
      fontFamily: {
        amazon: ['"Amazon Ember"', 'Arial', 'sans-serif'],
      }
    }
  }
}
```

### React Router v6
```jsx
// Route structure — App.jsx
<Routes>
  <Route path="/"              element={<Home />} />
  <Route path="/login"         element={<Login />} />
  <Route path="/register"      element={<Register />} />
  <Route path="/products"      element={<ProductList />} />
  <Route path="/products/:id"  element={<ProductDetail />} />
  <Route path="/cart"          element={<ProtectedRoute><Cart /></ProtectedRoute>} />
  <Route path="/checkout"      element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
  <Route path="/orders"        element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
  <Route path="/orders/:id"         element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
  <Route path="/orders/:id/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
</Routes>
```

---

## Backend Stack Detail

### Express.js Setup
```js
// app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/v1", routes);
app.use(errorMiddleware);

module.exports = app;
```

### Sequelize + PostgreSQL
```js
// config/database.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
);

module.exports = sequelize;
```

### JWT Pattern
```js
// utils/jwt.util.js
const jwt = require("jsonwebtoken");

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

module.exports = { signToken, verifyToken };
```

### bcrypt Pattern
```js
// In auth.service.js
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 12;

const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
```

### Standard Response Wrapper
```js
// utils/response.util.js
const success = (res, data, message = "Success", statusCode = 200) =>
  res.status(statusCode).json({ success: true, data, message });

const error = (res, message = "Error", statusCode = 400) =>
  res.status(statusCode).json({ success: false, error: message, statusCode });

module.exports = { success, error };
```

### Global Error Middleware
```js
// middlewares/error.middleware.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production"
    ? "Internal Server Error"
    : err.message;
  res.status(statusCode).json({ success: false, error: message, statusCode });
};
```

---

## Database Setup Commands

```bash
# Create the database
npx sequelize-cli db:create

# Run all migrations
npx sequelize-cli db:migrate

# Seed sample data
npx sequelize-cli db:seed:all

# Undo last migration (dev only)
npx sequelize-cli db:migrate:undo

# Undo all migrations (dev only)
npx sequelize-cli db:migrate:undo:all
```

---

## NPM Scripts

### Backend `package.json`
```json
{
  "scripts": {
    "dev":   "nodemon server.js",
    "start": "node server.js",
    "migrate":    "npx sequelize-cli db:migrate",
    "seed":       "npx sequelize-cli db:seed:all",
    "migrate:undo": "npx sequelize-cli db:migrate:undo"
  }
}
```

### Frontend `package.json`
```json
{
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview"
  }
}
```

---

## Key npm Packages

### Backend
```bash
npm install express sequelize pg pg-hstore bcrypt jsonwebtoken \
  express-validator dotenv morgan cors

npm install --save-dev nodemon sequelize-cli
```

### Frontend
```bash
npm install react react-dom react-router-dom axios

npm install --save-dev vite @vitejs/plugin-react tailwindcss \
  postcss autoprefixer
```

---

## Development Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 3000 | http://localhost:3000 |
| Backend (Express) | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |
