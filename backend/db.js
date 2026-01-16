import pkg from "pg";
const { Pool } = pkg;
import env from "dotenv";

env.config();

// List of required environment variables
const requiredEnvVars = [
  "PG_USER",
  "PG_HOST",
  "PG_DATABASE",
  "PG_PASSWORD",
  "PG_PORT",
  "PORT",
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET"
];

// Check each one exists
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
  console.error("Make sure your .env file has all required fields");
  process.exit(1); // Stop the server
}

console.log("✅ All environment variables validated");

// Connection pool with production-ready limits
export const db = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
  max: 20,                    // Maximum connections in pool
  idleTimeoutMillis: 30000,  // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail if can't get connection in 5s
});

// Handle pool errors
db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.end();
  console.log('Connection pool closed');
  process.exit(0);
});