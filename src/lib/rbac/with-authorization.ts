import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { AuthorizationError } from "./authorize";
import type { PermissionKey } from "./permissions";
import type { AuthorizationContext } from "./authorize";

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

type AuthorizedHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  authCtx: AuthorizationContext
) => Promise<NextResponse>;

/**
 * HOF that wraps a Route Handler with RBAC permission enforcement.
 * The caller must supply a `getAuthContext` function that resolves the
 * AuthorizationContext from the incoming request (e.g., reads the session).
 *
 * Returns 403 when no session exists or the user lacks `requiredPermission`.
 */
export function withAuthorization(
  getAuthContext: (req: NextRequest) => Promise<AuthorizationContext | null>,
  requiredPermission: PermissionKey,
  handler: AuthorizedHandler
): RouteHandler {
  return async (request, context) => {
    try {
      const authCtx = await getAuthContext(request);

      if (!authCtx) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }

      const { requirePermission } = await import("./authorize");
      requirePermission(authCtx, requiredPermission);

      return handler(request, context, authCtx);
    } catch (err) {
      if (err instanceof AuthorizationError) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      throw err;
    }
  };
}
