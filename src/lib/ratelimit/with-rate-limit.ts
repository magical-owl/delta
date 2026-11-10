import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, type RateLimitOptions } from "./limiter";

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

/** Extract the client IP from standard proxy headers or the request object. */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; use the first (client) IP
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  // Fallback — may be undefined in some environments
  return "unknown";
}

/**
 * HOF that wraps a Route Handler with sliding-window rate limiting.
 *
 * Returns 429 Too Many Requests when the limit is exceeded, including
 * a `Retry-After` header (in seconds) for RFC 6585 compliance.
 */
export function withRateLimit(
  options: Omit<RateLimitOptions, "key"> & { keyPrefix: string },
  handler: RouteHandler
): RouteHandler {
  return async (request, context) => {
    const ip = getClientIp(request);
    // Keys are always namespaced: ratelimit:<prefix>:<ip>
    const key = `ratelimit:${options.keyPrefix}:${ip}`;

    const result = await checkRateLimit({
      key,
      limit: options.limit,
      windowMs: options.windowMs,
    });

    if (!result.allowed) {
      const retryAfterSeconds = result.retryAfter
        ? Math.ceil(result.retryAfter / 1000)
        : 60;

      return NextResponse.json(
        {
          success: false,
          error: "Too Many Requests",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
          },
        }
      );
    }

    return handler(request, context);
  };
}
