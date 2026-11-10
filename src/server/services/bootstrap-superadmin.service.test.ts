import { describe, expect, it, vi, beforeEach } from "vitest";
import { bootstrapSuperadmin } from "./bootstrap-superadmin.service";
import * as userRepo from "../dal/repositories/user.repository";
import * as credRepo from "../dal/repositories/credential.repository";
import * as auditLogger from "@/lib/audit/log-event";

vi.mock("@/lib/audit/log-event", () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

describe("bootstrap-superadmin.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if superadmin already exists (duplicate safeguard)", async () => {
    vi.spyOn(userRepo, "countActiveSuperadmins").mockResolvedValueOnce(1);

    const result = await bootstrapSuperadmin({
      email: "newsuper@example.com",
      displayName: "New Super",
      password: "secure-password-1234",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already provisioned/i);
  });

  it("fails if password is too short", async () => {
    const result = await bootstrapSuperadmin({
      email: "newsuper@example.com",
      displayName: "New Super",
      password: "short",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/at least 12 characters/i);
  });

  it("fails if email is already in use by an existing user", async () => {
    vi.spyOn(userRepo, "countActiveSuperadmins").mockResolvedValueOnce(0);
    vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce({
      id: BigInt(5),
      publicId: "existing-uuid",
      email: "taken@example.com",
      displayName: "Existing User",
      auth0Subject: null,
      avatarUrl: null,
      isActive: true,
      status: "active",
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await bootstrapSuperadmin({
      email: "taken@example.com",
      displayName: "Super",
      password: "secure-password-1234",
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/already exists/i);
  });

  it("successfully creates superadmin, creates user_credentials record, assigns role, and logs audit event", async () => {
    vi.spyOn(userRepo, "countActiveSuperadmins").mockResolvedValueOnce(0);
    vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce(null);
    vi.spyOn(userRepo, "createUser").mockResolvedValueOnce({
      id: BigInt(1),
      publicId: "super-public-uuid",
      email: "admin@workspace.com",
      displayName: "Master Admin",
      auth0Subject: null,
      avatarUrl: null,
      isActive: true,
      status: "active",
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.spyOn(credRepo, "createUserCredential").mockResolvedValueOnce({
      id: BigInt(1),
      userId: BigInt(1),
      passwordHash: "hash",
      pepperVersion: "v1",
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.spyOn(userRepo, "assignUserRole").mockResolvedValueOnce(undefined);

    const result = await bootstrapSuperadmin({
      email: "admin@workspace.com",
      displayName: "Master Admin",
      password: "strong-secret-pass-phrase-999",
    });

    expect(result.success).toBe(true);
    expect(result.user?.publicId).toBe("super-public-uuid");
    expect(credRepo.createUserCredential).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: BigInt(1),
        pepperVersion: "v1",
      })
    );
    expect(userRepo.assignUserRole).toHaveBeenCalledWith(BigInt(1), "super_admin");
    expect(auditLogger.logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: BigInt(1),
        action: "system.bootstrap_superadmin",
        targetPublicId: "super-public-uuid",
      })
    );
  });
});
