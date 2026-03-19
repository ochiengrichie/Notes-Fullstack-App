import pkg from "pg";
const { Pool } = pkg;
import env from "dotenv";

env.config();

const requiredEnvVars = [
  "PGUSER",
  "PGHOST",
  "PGDATABASE",
  "PGPASSWORD",
  "PGPORT",
  "PORT",
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET"
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

export const db = new Pool({
  user: process.env.PGUSER || process.env.PG_USER,
  host: process.env.PGHOST || process.env.PG_HOST,
  database: process.env.PGDATABASE || process.env.PG_DATABASE,
  password: process.env.PGPASSWORD || process.env.PG_PASSWORD,
  port: Number(process.env.PGPORT || process.env.PG_PORT),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: false },
});

db.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

process.on("SIGINT", async () => {
  await db.end();
  console.log("Connection pool closed");
  process.exit(0);
});