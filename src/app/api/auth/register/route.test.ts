import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import * as limiter from "@/lib/ratelimit/limiter";

describe("POST /api/auth/register", () => {
  const originalEnv = process.env.ENABLE_PUBLIC_REGISTRATION;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.ENABLE_PUBLIC_REGISTRATION = originalEnv;
    } else {
      delete process.env.ENABLE_PUBLIC_REGISTRATION;
    }
  });

  it("fails closed (403) by default when ENABLE_PUBLIC_REGISTRATION is not set", async () => {
    delete process.env.ENABLE_PUBLIC_REGISTRATION;

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "x-forwarded-for": "192.168.1.1" },
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/public registration is currently disabled/i);
  });

  it("fails closed (403) when ENABLE_PUBLIC_REGISTRATION has invalid value like 'false', '0', or 'yes'", async () => {
    process.env.ENABLE_PUBLIC_REGISTRATION = "false";
    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("enforces rate-limiting returning 429 when quota exceeded", async () => {
    vi.spyOn(limiter, "checkRateLimit").mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      retryAfter: 60,
    });

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });
});
