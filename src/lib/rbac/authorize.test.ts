import { describe, it, expect } from "vitest";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
  AuthorizationError,
  type AuthorizationContext,
} from "./authorize";
import { Permission } from "./permissions";

// authorize.ts imports 'server-only' — vitest.setup.ts (or the mock below) handles that.

describe("hasPermission", () => {
  it("returns true when the user holds the exact permission", () => {
    expect(hasPermission([Permission.USERS_READ], Permission.USERS_READ)).toBe(true);
  });

  it("returns false when the permission is not present", () => {
    expect(hasPermission([Permission.USERS_READ], Permission.USERS_WRITE)).toBe(false);
  });

  it("returns true for any permission when the user holds ADMIN_ALL", () => {
    expect(hasPermission([Permission.ADMIN_ALL], Permission.USERS_DELETE)).toBe(true);
    expect(hasPermission([Permission.ADMIN_ALL], Permission.SETTINGS_WRITE)).toBe(true);
  });

  it("returns false for an empty permission list", () => {
    expect(hasPermission([], Permission.USERS_READ)).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("returns true if the user holds at least one of the required permissions", () => {
    expect(
      hasAnyPermission(
        [Permission.USERS_READ],
        [Permission.USERS_READ, Permission.USERS_WRITE]
      )
    ).toBe(true);
  });

  it("returns false if the user holds none of the required permissions", () => {
    expect(
      hasAnyPermission(
        [Permission.SETTINGS_READ],
        [Permission.USERS_READ, Permission.USERS_WRITE]
      )
    ).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("returns true when the user holds all required permissions", () => {
    expect(
      hasAllPermissions(
        [Permission.USERS_READ, Permission.USERS_WRITE],
        [Permission.USERS_READ, Permission.USERS_WRITE]
      )
    ).toBe(true);
  });

  it("returns false when the user is missing at least one required permission", () => {
    expect(
      hasAllPermissions(
        [Permission.USERS_READ],
        [Permission.USERS_READ, Permission.USERS_WRITE]
      )
    ).toBe(false);
  });

  it("returns true when ADMIN_ALL is present, satisfying all requirements", () => {
    expect(
      hasAllPermissions(
        [Permission.ADMIN_ALL],
        [Permission.USERS_DELETE, Permission.ROLES_WRITE]
      )
    ).toBe(true);
  });
});

describe("requirePermission", () => {
  const makeCtx = (
    permissions: (typeof Permission)[keyof typeof Permission][]
  ): AuthorizationContext => ({
    userId: BigInt(42),
    permissions,
  });

  it("does not throw when the user holds the required permission", () => {
    expect(() =>
      requirePermission(makeCtx([Permission.USERS_READ]), Permission.USERS_READ)
    ).not.toThrow();
  });

  it("throws AuthorizationError when the permission is missing", () => {
    expect(() =>
      requirePermission(makeCtx([Permission.USERS_READ]), Permission.USERS_WRITE)
    ).toThrow(AuthorizationError);
  });

  it("thrown error message contains the missing permission", () => {
    try {
      requirePermission(makeCtx([]), Permission.AUDIT_READ);
      expect.fail("expected AuthorizationError");
    } catch (err) {
      expect(err).toBeInstanceOf(AuthorizationError);
      expect((err as AuthorizationError).message).toContain(Permission.AUDIT_READ);
    }
  });

  it("does not throw when ADMIN_ALL is present", () => {
    expect(() =>
      requirePermission(makeCtx([Permission.ADMIN_ALL]), Permission.USERS_DELETE)
    ).not.toThrow();
  });
});
