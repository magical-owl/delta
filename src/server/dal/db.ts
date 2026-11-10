import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema/index";

// ---------------------------------------------------------------------------
// Singleton helpers — survive Next.js dev-mode hot-reload
// ---------------------------------------------------------------------------

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __pgPool: Pool | undefined;
  var __drizzleDb: DrizzleDb | undefined;
}

// ---------------------------------------------------------------------------
// Lazy proxy — thrown only on first actual DB access, not at import time.
// This lets tests that don't touch the DB run without DATABASE_URL.
// ---------------------------------------------------------------------------

function createLazyProxy(): DrizzleDb {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === "then") return undefined; // not a thenable — don't confuse await
      throw new Error(
        "[DB] DATABASE_URL is not set. " +
          "Provide a valid PostgreSQL connection string to use the database."
      );
    },
    apply() {
      throw new Error("[DB] DATABASE_URL is not set.");
    },
  };
  return new Proxy({} as object, handler) as unknown as DrizzleDb;
}

// ---------------------------------------------------------------------------
// Pool + Drizzle initialisation
// ---------------------------------------------------------------------------

function createPool(url: string): Pool {
  return new Pool({ connectionString: url });
}

function initialise(): { db: DrizzleDb; pool: Pool | null } {
  const url = process.env.DATABASE_URL;

  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[DB] DATABASE_URL environment variable is required in production. " +
          "Set it to a valid PostgreSQL connection string before starting the server."
      );
    }

    // Dev / test without a DB configured — return a lazy proxy.
    return { db: createLazyProxy(), pool: null };
  }

  // Singleton per process — reuse across hot-reloads in dev.
  if (!globalThis.__pgPool) {
    globalThis.__pgPool = createPool(url);
  }

  if (!globalThis.__drizzleDb) {
    globalThis.__drizzleDb = drizzle(globalThis.__pgPool, { schema });
  }

  return { db: globalThis.__drizzleDb, pool: globalThis.__pgPool };
}

const { db, pool } = initialise();

export { db, pool };
export type { DrizzleDb };
