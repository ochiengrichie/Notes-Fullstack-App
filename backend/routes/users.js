// routes/users.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { db } from "../db.js";
import env from "dotenv";
import { validateEmail, validatePasswordStrength } from "../utils/validation.js";

env.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
const saltRounds = 10;

// Ensures consistent Standard API response structure across all user endpoints
function sendResponse(res, success, data = null, error = null, statusCode = 200) {
  return res.status(statusCode).json({ success, data, error });
}

// Helper: Create access and refresh tokens
function createTokens(user) {
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: "7d" });
  return { token, refreshToken };
}

// Register new user with validation
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // Input presence validation
  if (!email || !password) {
    return sendResponse(res, false, null, "Email and password required", 400);
  }

  // Email format validation
  if (!validateEmail(email.trim())) {
    return sendResponse(res, false, null, "Invalid email format", 400);
  }

  // Password strength validation
  const passwordStrength = validatePasswordStrength(password);
  if (!passwordStrength.isValid) {
    return sendResponse(res, false, null, `Password requirements: ${passwordStrength.errors.join(", ")}`, 400);
  }

  try {
    // Check if user exists
    const existing = await db.query("SELECT id FROM users WHERE email=$1", [email.trim()]);
    if (existing.rows.length > 0) {
      return sendResponse(res, false, null, "Email already registered", 409);
    }

    // Hash password
    const hashed = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email.trim(), hashed]
    );

    sendResponse(res, true, result.rows[0], null, 201);
  } catch (err) {
    console.error("POST /users/register error:", err);
    sendResponse(res, false, null, "Registration failed", 500);
  }
});

// User login with JWT + refresh token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendResponse(res, false, null, "Email and password required", 400);
  }

  // Email format validation
  if (!validateEmail(email.trim())) {
    return sendResponse(res, false, null, "Invalid email format", 400);
  }

  try {
    const result = await db.query("SELECT * FROM users WHERE email=$1", [email.trim()]);
    const user = result.rows[0];
    if (!user) {
      return sendResponse(res, false, null, "Invalid credentials", 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return sendResponse(res, false, null, "Invalid credentials", 401);
    }

    const { token, refreshToken } = createTokens(user);

    // Secure cookies for production (use secure: true in production with HTTPS)
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 60*60*1000 
    });
    res.cookie("refreshToken", refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 7*24*60*60*1000 
    });

    sendResponse(res, true, { message: "Login successful" });
  } catch (err) {
    console.error("POST /users/login error:", err);
    sendResponse(res, false, null, "Login failed", 500);
  }
});

// Google OAuth login
router.post("/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return sendResponse(res, false, null, "Google credential required", 400);
  }

  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email;
    const googleSub = payload.sub;

    // Validate email
    if (!validateEmail(email)) {
      return sendResponse(res, false, null, "Invalid email from Google", 400);
    }

    // Check if user exists
    let result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    let user = result.rows[0];

    if (user) {
      // Link Google account if not linked
      if (!user.google_id) {
        await db.query("UPDATE users SET google_id=$1, auth_provider='google' WHERE id=$2", [googleSub, user.id]);
      }
    } else {
      // Create new user
      const create = await db.query(
        "INSERT INTO users (email, google_id, auth_provider) VALUES ($1, $2, 'google') RETURNING *",
        [email, googleSub]
      );
      user = create.rows[0];
    }

    const { token, refreshToken } = createTokens(user);
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 60*60*1000 
    });
    res.cookie("refreshToken", refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 7*24*60*60*1000 
    });

    sendResponse(res, true, { message: "Google login successful" });
  } catch (err) {
    console.error("POST /users/google error:", err);
    sendResponse(res, false, null, "Google authentication failed", 401);
  }
});

// Refresh JWT token using refresh token
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return sendResponse(res, false, null, "Refresh token required", 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const result = await db.query("SELECT * FROM users WHERE id=$1", [decoded.id]);
    const user = result.rows[0];
    if (!user) {
      return sendResponse(res, false, null, "User not found", 404);
    }

    const newToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", newToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 60*60*1000 
    });

    sendResponse(res, true, { message: "Token refreshed successfully" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return sendResponse(res, false, null, "Refresh token expired, please login again", 401);
    }
    console.error("POST /users/refresh error:", err);
    sendResponse(res, false, null, "Token refresh failed", 401);
  }
});

// Clear cookies to log user out
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  sendResponse(res, true, { message: "Logged out" });
});

export default router;
