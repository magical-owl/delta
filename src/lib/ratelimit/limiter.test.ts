import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RateLimitResult } from "./limiter";

// Mock the redis-client module so no real Redis connection is attempted
vi.mock("./redis-client", () => ({
  getRedisClient: vi.fn(() => null),
}));

// Import after mocking
const { checkRateLimit } = await import("./limiter");

describe("checkRateLimit — no-op mode (Redis null)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("always returns allowed: true when Redis client is null", async () => {
    const result: RateLimitResult = await checkRateLimit({
      key: "ratelimit:login:127.0.0.1",
      limit: 5,
      windowMs: 60_000,
    });

    expect(result.allowed).toBe(true);
  });

  it("returns remaining equal to the configured limit", async () => {
    const limit = 10;
    const result = await checkRateLimit({
      key: "ratelimit:login:127.0.0.1",
      limit,
      windowMs: 60_000,
    });

    expect(result.remaining).toBe(limit);
  });

  it("returns retryAfter as null when allowed", async () => {
    const result = await checkRateLimit({
      key: "ratelimit:login:127.0.0.1",
      limit: 5,
      windowMs: 60_000,
    });

    expect(result.retryAfter).toBeNull();
  });

  it("result conforms to the RateLimitResult shape", async () => {
    const result = await checkRateLimit({
      key: "ratelimit:api:192.168.1.1",
      limit: 100,
      windowMs: 1_000,
    });

    expect(result).toHaveProperty("allowed");
    expect(result).toHaveProperty("remaining");
    expect(result).toHaveProperty("retryAfter");
    expect(typeof result.allowed).toBe("boolean");
    expect(typeof result.remaining).toBe("number");
  });
});
