import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./auth-schema.ts";
import * as schema from "./schema.ts";

const isServer = typeof window === "undefined";
const databaseUrl = isServer ? process.env.DATABASE_URL : undefined;

if (isServer && !databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const sql = isServer && databaseUrl ? neon(databaseUrl) : undefined;

export const dbSchema = {
  ...schema,
  ...authSchema,
};

let dbInstance: ReturnType<typeof drizzle<typeof dbSchema>>;

if (isServer && sql) {
  dbInstance = drizzle({
    client: sql,
    schema: dbSchema,
  });
} else {
  dbInstance = undefined as unknown as ReturnType<
    typeof drizzle<typeof dbSchema>
  >;
}

export const db = dbInstance;
