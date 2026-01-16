import express from "express";
import cors from "cors";
import notesRoutes from "./routes/notes.js";
import usersRoutes from "./routes/users.js";
import env from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

// General API limiter: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later"
});

// Strict limiter for login: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, try again later"
});

const app = express();
app.use(cookieParser())

// Get frontend URL from environment, fallback to localhost for development
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
    origin: FRONTEND_URL, // the frontend
    credentials: true
}));
app.use(express.json({ limit: "10mb" })); // Max 10MB JSON body
app.use(express.urlencoded({ limit: "10mb" })); // Max 10MB form data
env.config();

app.use(limiter);
app.use("/api/v1/users/login", loginLimiter); // apply strict limiter to login route
app.use("/api/v1/users/register", loginLimiter); // apply strict limiter to register route
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/users", usersRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
