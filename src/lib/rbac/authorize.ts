import "server-only";

import { Permission, type PermissionKey } from "./permissions";

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export type AuthorizationContext = {
  userId: bigint;
  permissions: PermissionKey[];
};

/**
 * Returns true if the user holds ADMIN_ALL (grants every permission)
 * or explicitly holds the required permission.
 */
export function hasPermission(
  userPermissions: PermissionKey[],
  required: PermissionKey
): boolean {
  return (
    userPermissions.includes(Permission.ADMIN_ALL) || userPermissions.includes(required)
  );
}

export function hasAnyPermission(
  userPermissions: PermissionKey[],
  required: PermissionKey[]
): boolean {
  return required.some((p) => hasPermission(userPermissions, p));
}

export function hasAllPermissions(
  userPermissions: PermissionKey[],
  required: PermissionKey[]
): boolean {
  return required.every((p) => hasPermission(userPermissions, p));
}

/**
 * Throws AuthorizationError when the context does not hold the required permission.
 */
export function requirePermission(
  ctx: AuthorizationContext,
  required: PermissionKey
): void {
  if (!hasPermission(ctx.permissions, required)) {
    throw new AuthorizationError(`User ${ctx.userId} lacks permission: ${required}`);
  }
}
