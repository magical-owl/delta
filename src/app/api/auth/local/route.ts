import "server-only";

import { NextRequest, NextResponse } from "next/server";
import {
  authenticateLocalCredentials,
  revokeLocalSession,
} from "@/server/services/local-auth.service";

/**
 * Local Authentication Endpoint.
 * Supports Superadmin and local credential sign-in.
 */
export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required" },
      { status: 400 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const result = await authenticateLocalCredentials(email, password, ip, userAgent);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: result.user,
  });
}

/**
 * Logout Endpoint — revokes database session and clears cookie.
 */
export async function DELETE() {
  await revokeLocalSession();
  return NextResponse.json({ success: true });
}
