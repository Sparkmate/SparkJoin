import { jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";

export const config = pgTable("config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
});
