import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { isPublicRegistrationEnabled } from "@/lib/auth/registration-config";
import { checkRateLimit } from "@/lib/ratelimit/limiter";

/**
 * Public Self-Registration Endpoint Guard.
 *
 * Requirements:
 * - Public self-registration is disabled by default.
 * - Missing or invalid ENABLE_PUBLIC_REGISTRATION configuration fails closed.
 * - Rate-limited to prevent automated brute-force attempts.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

  // Rate limiting: 5 attempts per 15 minutes per IP
  const rateLimit = await checkRateLimit({
    key: `ratelimit:register:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many registration attempts. Please try again later.",
      },
      {
        status: 429,
        headers: rateLimit.retryAfter
          ? { "Retry-After": String(rateLimit.retryAfter) }
          : undefined,
      }
    );
  }

  // Server-side check: Must independently enforce policy even if client bypasses UI
  const isEnabled = isPublicRegistrationEnabled();
  if (!isEnabled) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Public registration is currently disabled. Account registration is by administrator invitation only.",
      },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error:
        "Public self-registration requires federated identity through configured identity provider.",
    },
    { status: 400 }
  );
}
