import pkg from "pg";
const { Pool } = pkg;
import env from "dotenv";

env.config();

const requiredEnvVars = [
  "DATABASE_URL",
  "PORT",
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET"
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

console.log("All environment variables validated");

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

process.on("SIGINT", async () => {
  await db.end();
  console.log("Connection pool closed");
  process.exit(0);
});