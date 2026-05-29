const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// Middlewares
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://amazon-clone-harshptl.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000", // buyer
  "http://localhost:3001", // seller
  "http://localhost:3002", // admin
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Routes
app.use("/api/v1", routes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Amazon Clone API (Buyer Module)" });
});

// Error handling
app.use(errorMiddleware);

module.exports = app;
