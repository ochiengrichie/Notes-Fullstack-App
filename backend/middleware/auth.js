// middleware/auth.js
import jwt from "jsonwebtoken";
import env from "dotenv";

env.config();

const JWT_SECRET = process.env.JWT_SECRET; // must match login secret

export function auth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      data: null, 
      error: "Authentication required" 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        data: null, 
        error: "Token expired", 
        code: "TOKEN_EXPIRED" 
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        data: null, 
        error: "Invalid token", 
        code: "INVALID_TOKEN" 
      });
    }
    console.error("JWT verification error:", err.message); 
    res.status(401).json({ 
      success: false, 
      data: null, 
      error: "Authentication failed" 
    });
  }
};
