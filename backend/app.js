const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// Middlewares
app.use(cors({
  origin: [process.env.CORS_ORIGIN, "http://localhost:5173", "http://localhost:3000"].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/v1", routes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Amazon Clone API (Buyer Module)" });
});

// Error handling
app.use(errorMiddleware);

module.exports = app;
