import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(), // NOT required field, only so we know what the user signed up for the first time with
  // firstname, lastname etc.
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: serial("user_id")
    .references(() => users.id)
    .notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  email: varchar("email", { length: 256 }).notNull(), // NOT required field (only for tracking user emails)
});
