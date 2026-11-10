import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock("@/lib/audit/log-event", () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

import {
  authenticateLocalCredentials,
  revokeLocalSession,
  LOCAL_SESSION_COOKIE_NAME,
} from "./local-auth.service";
import * as userRepo from "../dal/repositories/user.repository";
import * as credRepo from "../dal/repositories/credential.repository";
import * as sessionRepo from "../dal/repositories/session.repository";
import * as hasher from "@/lib/auth/password-hasher";
import * as limiter from "@/lib/ratelimit/limiter";
import { cookies } from "next/headers";

describe("local-auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if rate limit is exceeded", async () => {
    vi.spyOn(limiter, "checkRateLimit").mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      retryAfter: 60,
    });

    const res = await authenticateLocalCredentials("user@example.com", "password");
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/too many login attempts/i);
  });

  it("returns generic failure for unknown email to prevent enumeration", async () => {
    vi.spyOn(limiter, "checkRateLimit").mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      retryAfter: null,
    });
    vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce(null);
    vi.spyOn(hasher, "verifyPassword").mockResolvedValueOnce(false);

    const res = await authenticateLocalCredentials("unknown@example.com", "password");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid email or password.");
  });

  it("returns generic failure for invalid password", async () => {
    vi.spyOn(limiter, "checkRateLimit").mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      retryAfter: null,
    });
    vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce({
      id: BigInt(1),
      publicId: "u-1",
      email: "admin@example.com",
      displayName: "Admin",
      auth0Subject: null,
      avatarUrl: null,
      isActive: true,
      status: "active",
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.spyOn(credRepo, "findUserCredentialByUserId").mockResolvedValueOnce({
      id: BigInt(1),
      userId: BigInt(1),
      passwordHash: "storedHash",
      pepperVersion: "v1",
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.spyOn(hasher, "verifyPassword").mockResolvedValueOnce(false); // wrong password

    const res = await authenticateLocalCredentials("admin@example.com", "wrong-password");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid email or password.");
  });

  it("rejects disabled accounts with explicit account message", async () => {
    vi.spyOn(limiter, "checkRateLimit").mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      retryAfter: null,
    });
    vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce({
      id: BigInt(2),
      publicId: "u-2",
      email: "disabled@example.com",
      displayName: "Disabled",
      auth0Subject: null,
      avatarUrl: null,
      isActive: false,
      status: "disabled",
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.spyOn(credRepo, "findUserCredentialByUserId").mockResolvedValueOnce({
      id: BigInt(2),
      userId: BigInt(2),
      passwordHash: "storedHash",
      pepperVersion: "v1",
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.spyOn(hasher, "verifyPassword").mockResolvedValueOnce(true);

    const res = await authenticateLocalCredentials(
      "disabled@example.com",
      "correct-password"
    );
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/account has been disabled/i);
  });

  it("authenticates successfully, creates session, and sets cookie", async () => {
    vi.spyOn(limiter, "checkRateLimit").mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      retryAfter: null,
    });
    vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce({
      id: BigInt(3),
      publicId: "u-3",
      email: "super@example.com",
      displayName: "Super Admin",
      auth0Subject: null,
      avatarUrl: null,
      isActive: true,
      status: "active",
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.spyOn(credRepo, "findUserCredentialByUserId").mockResolvedValueOnce({
      id: BigInt(3),
      userId: BigInt(3),
      passwordHash: "storedHash",
      pepperVersion: "v1",
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.spyOn(hasher, "verifyPassword").mockResolvedValueOnce(true);
    vi.spyOn(sessionRepo, "createSessionRecord").mockResolvedValueOnce({
      id: BigInt(10),
      userId: BigInt(3),
      tokenHash: "tokenHash",
      ipAddress: "127.0.0.1",
      userAgent: null,
      expiresAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.spyOn(userRepo, "getUserRoleNames").mockResolvedValueOnce(["super_admin"]);

    const res = await authenticateLocalCredentials(
      "super@example.com",
      "correct-password"
    );
    expect(res.success).toBe(true);
    expect(res.user?.publicId).toBe("u-3");
    expect(res.user?.roles).toContain("super_admin");

    const cookieJar = await cookies();
    expect(cookieJar.set).toHaveBeenCalledWith(
      LOCAL_SESSION_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: "lax" })
    );
  });

  it("revokes session and deletes cookie on logout", async () => {
    const cookieJar = await cookies();
    vi.mocked(cookieJar.get).mockReturnValueOnce({
      name: LOCAL_SESSION_COOKIE_NAME,
      value: "active-token-value",
    });
    vi.spyOn(sessionRepo, "revokeSessionByTokenHash").mockResolvedValueOnce(undefined);

    await revokeLocalSession();

    expect(sessionRepo.revokeSessionByTokenHash).toHaveBeenCalled();
    expect(cookieJar.delete).toHaveBeenCalledWith(LOCAL_SESSION_COOKIE_NAME);
  });
});
