import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv/config";
import path from "path";

import mainRoutes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 8001;

// Security-enhanced CORS configuration
const corsConfig = {
  origin: process.env.CLIENT_URL || "*", // Preferably use specific origin in production
  credentials: true,
  methods: "GET, POST, PATCH, DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};

// Middleware
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(cors(corsConfig));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes
app.use("/", mainRoutes);

// Frontend static files
app.use(express.static(path.join("client/dist")));
app.use("*", (req, res) =>
  res.sendFile(path.resolve("client/dist/index.html"))
);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({
    message: "An unexpected error occurred",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server Listening at PORT - ${PORT}`);
});
