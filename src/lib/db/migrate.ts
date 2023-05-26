import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DATABASE_URL } from "./db";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const migrationClient = postgres(DATABASE_URL, { max: 1 });

migrate(drizzle(migrationClient), {
  migrationsFolder: "src/lib/db/migrations"
});
