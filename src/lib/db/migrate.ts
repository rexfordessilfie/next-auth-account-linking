import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { env } from "@/env.mjs";

const migrationClient = postgres(env.DATABASE_URL, { max: 1, ssl: "allow" });

migrate(drizzle(migrationClient), {
  migrationsFolder: "src/lib/db/migrations",
});
