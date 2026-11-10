import "server-only";

import type { Redis } from "ioredis";

let client: Redis | null = null;
let initialized = false;

/**
 * Returns the singleton Redis client.
 *
 * - In production: REDIS_URL is required; throws at startup if missing.
 * - In development/test: returns null (no-op mode) when REDIS_URL is absent.
 *
 * Connection errors are logged but do not crash the process.
 */
export function getRedisClient(): Redis | null {
  if (initialized) return client;
  initialized = true;

  const url = process.env.REDIS_URL;

  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[redis-client] REDIS_URL is required in production but was not set."
      );
    }
    // Dev / test: no-op mode
    console.warn(
      "[redis-client] REDIS_URL not set — running in no-op mode (rate limiting disabled)."
    );
    return null;
  }

  // Lazy import to avoid loading ioredis unless actually needed.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: Redis } = require("ioredis") as {
    default: new (url: string, opts: object) => Redis;
  };

  const instance = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  instance.on("error", (err: Error) => {
    console.error("[redis-client] Connection error:", err.message);
  });

  client = instance;
  return client;
}
