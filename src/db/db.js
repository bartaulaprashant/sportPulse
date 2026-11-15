import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const isNeonUrl = databaseUrl.includes("neon.tech");

export const pool = new pg.Pool({
  connectionString: databaseUrl,
  ...(isNeonUrl ? { ssl: { rejectUnauthorized: false } } : {}),
});

export const db = drizzle(pool);