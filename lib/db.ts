import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

type Database = NodePgDatabase<typeof schema>;

declare global {
  var __googleOAuthDemoPool: Pool | undefined;
  var __googleOAuthDemoDb: Database | undefined;
}

const pool =
  globalThis.__googleOAuthDemoPool ??
  new Pool({
    connectionString: databaseUrl,
  });

const db =
  globalThis.__googleOAuthDemoDb ??
  drizzle(pool, {
    schema,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__googleOAuthDemoPool = pool;
  globalThis.__googleOAuthDemoDb = db;
}

export { db, pool };
