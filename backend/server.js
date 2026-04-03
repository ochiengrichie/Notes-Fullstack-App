import express from "express";
import cors from "cors";
import notesRoutes from "./routes/notes.js";
import usersRoutes from "./routes/users.js";
import env from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

env.config();

const app = express();
app.set("trust proxy", 1);
app.use(cookieParser());

const allowedOrigins = [
  "https://notes-fullstack-app-git-main-richards-projects-c1649e52.vercel.app",
  "https://notes-fullstack-app-kappa.vercel.app",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later"
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many login attempts, try again later"
});

app.use(limiter);
app.use("/api/v1/users/login", loginLimiter);
app.use("/api/v1/users/register", loginLimiter);

app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/users", usersRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));