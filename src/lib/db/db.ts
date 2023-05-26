import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:admin12345@localhost:5432/my_db";

const client = postgres(DATABASE_URL);

export const db = drizzle(client);
