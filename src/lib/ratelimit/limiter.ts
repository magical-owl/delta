import "server-only";

import { getRedisClient } from "./redis-client";

export interface RateLimitOptions {
  /** Namespaced key, e.g. `ratelimit:login:<ip>` */
  key: string;
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Sliding window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Milliseconds until the client may retry, or null if the request is allowed */
  retryAfter: number | null;
}

/**
 * Atomically implements a Redis sliding-window rate limiter using a Lua script.
 *
 * The script:
 *  1. Removes entries older than the window
 *  2. Counts current entries
 *  3. If under the limit, records the new request with an expiry
 *  4. Returns [count_after_add, is_allowed]
 */
const SLIDING_WINDOW_LUA = `
local key        = KEYS[1]
local now        = tonumber(ARGV[1])
local window_ms  = tonumber(ARGV[2])
local limit      = tonumber(ARGV[3])
local expire_sec = math.ceil(window_ms / 1000)

-- Remove entries outside the current window
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window_ms)

-- Count entries within the window
local count = redis.call('ZCARD', key)

if count < limit then
  -- Add this request (score = timestamp for ordering, member = timestamp+random for uniqueness)
  redis.call('ZADD', key, now, now .. '-' .. math.random(1, 1000000))
  redis.call('EXPIRE', key, expire_sec)
  return {count + 1, 1}
else
  return {count, 0}
end
`;

export async function checkRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  // No-op mode (dev without Redis)
  if (!redis) {
    return { allowed: true, remaining: options.limit, retryAfter: null };
  }

  const now = Date.now();

  const result = (await redis.eval(
    SLIDING_WINDOW_LUA,
    1,
    options.key,
    String(now),
    String(options.windowMs),
    String(options.limit)
  )) as [number, number];

  const [count, allowed] = result;
  const isAllowed = allowed === 1;
  const remaining = Math.max(0, options.limit - count);

  return {
    allowed: isAllowed,
    remaining,
    retryAfter: isAllowed ? null : options.windowMs,
  };
}
