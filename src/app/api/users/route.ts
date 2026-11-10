import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { Permission } from "@/lib/rbac/permissions";
import { checkRateLimit } from "@/lib/ratelimit/limiter";
import {
  findUserByAuth0Subject,
  getUserRoleNames,
  listUsersSafe,
} from "@/server/dal/repositories/user.repository";
import {
  provisionUserByAdmin,
  updateUserAccountStatus,
} from "@/server/services/admin-user.service";
import {
  createUserSchema,
  updateUserStatusSchema,
} from "@/lib/validation/user-management.schema";

/**
 * Helper to authenticate and build admin actor context.
 */
async function getAdminActor() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  const dbUser = await findUserByAuth0Subject(sessionUser.sub);
  if (!dbUser || !dbUser.isActive || dbUser.status === "disabled") {
    return null;
  }

  const roleNames = await getUserRoleNames(dbUser.id);
  const permissions: string[] = [];

  // Superadmin bypass
  if (roleNames.includes("super_admin")) {
    permissions.push(Permission.ADMIN_ALL);
  } else if (roleNames.includes("admin")) {
    permissions.push(
      Permission.USERS_READ,
      Permission.USERS_WRITE,
      Permission.USERS_CREATE
    );
  } else if (roleNames.includes("manager")) {
    permissions.push(Permission.USERS_READ);
  } else {
    permissions.push(Permission.USERS_READ);
  }

  return {
    userId: dbUser.id,
    userPublicId: dbUser.publicId,
    email: dbUser.email,
    permissions,
  };
}

/**
 * GET /api/users
 * Lists users using safe public DTOs (no internal BIGINTs).
 * Protected by USERS_READ permission.
 */
export async function GET(request: NextRequest) {
  const actor = await getAdminActor();
  if (
    !actor ||
    (!actor.permissions.includes(Permission.ADMIN_ALL) &&
      !actor.permissions.includes(Permission.USERS_READ))
  ) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 100);
  const offset = Math.max(Number(searchParams.get("offset") || 0), 0);

  const data = await listUsersSafe({ search, limit, offset });

  return NextResponse.json({
    success: true,
    data: data.users,
    total: data.total,
  });
}

/**
 * POST /api/users
 * Administrative user provisioning.
 * Protected by USERS_CREATE permission, rate-limited, Zod-validated.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

  // Rate limiting: 20 creations per 15 minutes per IP
  const rateLimit = await checkRateLimit({
    key: `ratelimit:user-provision:${ip}`,
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: rateLimit.retryAfter
          ? { "Retry-After": String(rateLimit.retryAfter) }
          : undefined,
      }
    );
  }

  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const parseResult = createUserSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const result = await provisionUserByAdmin(actor, parseResult.data, ip);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    data: result.user,
    invitationStatus: result.invitationStatus,
  });
}

/**
 * PATCH /api/users
 * Updates account status (active vs disabled).
 */
export async function PATCH(request: NextRequest) {
  const actor = await getAdminActor();
  if (!actor) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get("publicId");
  if (!publicId) {
    return NextResponse.json(
      { success: false, error: "Target publicId is required" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const parseResult = updateUserStatusSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: "Invalid status value" },
      { status: 400 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

  const result = await updateUserAccountStatus(
    actor,
    publicId,
    parseResult.data.status,
    ip
  );

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
