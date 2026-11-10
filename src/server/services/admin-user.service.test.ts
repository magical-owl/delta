import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  provisionUserByAdmin,
  updateUserAccountStatus,
  type AdminActorContext,
} from "./admin-user.service";
import * as userRepo from "../dal/repositories/user.repository";
import * as inviteRepo from "../dal/repositories/invitation.repository";
import * as auditLogger from "@/lib/audit/log-event";
import { Permission } from "@/lib/rbac/permissions";

vi.mock("@/lib/audit/log-event", () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

describe("admin-user.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const superAdminActor: AdminActorContext = {
    userId: BigInt(1),
    userPublicId: "00000000-0000-0000-0000-000000000001",
    email: "superadmin@example.com",
    permissions: [Permission.ADMIN_ALL],
  };

  const ordinaryAdminActor: AdminActorContext = {
    userId: BigInt(2),
    userPublicId: "00000000-0000-0000-0000-000000000002",
    email: "admin@example.com",
    permissions: [Permission.USERS_READ, Permission.USERS_WRITE, Permission.USERS_CREATE],
  };

  const viewerActor: AdminActorContext = {
    userId: BigInt(3),
    userPublicId: "00000000-0000-0000-0000-000000000003",
    email: "viewer@example.com",
    permissions: [Permission.USERS_READ],
  };

  describe("provisionUserByAdmin", () => {
    it("rejects unauthorized actors lacking users:create permission", async () => {
      const result = await provisionUserByAdmin(viewerActor, {
        email: "test@example.com",
        displayName: "Test User",
        role: "viewer",
        sendInvitation: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized.*users:create/i);
    });

    it("prevents ordinary admin from granting super_admin role (privilege escalation defense)", async () => {
      const result = await provisionUserByAdmin(ordinaryAdminActor, {
        email: "newsuper@example.com",
        displayName: "New Super",
        // @ts-expect-error Testing invalid runtime role escalation
        role: "super_admin",
        sendInvitation: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/only superadmins can assign.*superadmin/i);
    });

    it("detects and rejects duplicate email accounts", async () => {
      vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce({
        id: BigInt(10),
        publicId: "existing-uuid",
        email: "existing@example.com",
        displayName: "Existing",
        auth0Subject: null,
        avatarUrl: null,
        isActive: true,
        status: "active",
        passwordHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await provisionUserByAdmin(ordinaryAdminActor, {
        email: "existing@example.com",
        displayName: "Duplicate User",
        role: "viewer",
        sendInvitation: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/already exists/i);
    });

    it("successfully creates pending user, hashes invitation token, assigns role, and records audit event", async () => {
      vi.spyOn(userRepo, "findUserByEmail").mockResolvedValueOnce(null);
      vi.spyOn(userRepo, "createUser").mockResolvedValueOnce({
        id: BigInt(25),
        publicId: "new-user-public-id",
        email: "newbie@example.com",
        displayName: "Newbie User",
        auth0Subject: null,
        avatarUrl: null,
        isActive: true,
        status: "pending",
        passwordHash: null,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      });
      vi.spyOn(userRepo, "assignUserRole").mockResolvedValueOnce(undefined);
      vi.spyOn(userRepo, "getUserRoleNames").mockResolvedValueOnce(["manager"]);
      vi.spyOn(inviteRepo, "createInvitationTokenRecord").mockResolvedValueOnce({
        id: BigInt(1),
        userId: BigInt(25),
        tokenHash: "abc",
        expiresAt: new Date(),
        usedAt: null,
        createdAt: new Date(),
      });

      const result = await provisionUserByAdmin(ordinaryAdminActor, {
        email: "newbie@example.com",
        displayName: "Newbie User",
        role: "manager",
        sendInvitation: true,
      });

      expect(result.success).toBe(true);
      expect(result.user?.publicId).toBe("new-user-public-id");
      expect(result.user?.status).toBe("pending");
      expect(result.user?.roles).toContain("manager");
      // Must not leak internal BIGINT
      expect((result.user as unknown as { id?: unknown }).id).toBeUndefined();

      expect(auditLogger.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          actorUserId: BigInt(2),
          action: "user.admin_provision",
          targetPublicId: "new-user-public-id",
        })
      );
    });
  });

  describe("updateUserAccountStatus & Last-Superadmin Protection", () => {
    it("denies disabling when actor lacks permission", async () => {
      const result = await updateUserAccountStatus(
        viewerActor,
        "some-user-uuid",
        "disabled"
      );
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized/i);
    });

    it("prevents disabling the last active Superadmin", async () => {
      vi.spyOn(userRepo, "findUserByPublicId").mockResolvedValueOnce({
        id: BigInt(1),
        publicId: "superadmin-uuid",
        email: "superadmin@example.com",
        displayName: "Superadmin",
        auth0Subject: null,
        avatarUrl: null,
        isActive: true,
        status: "active",
        passwordHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(userRepo, "getUserRoleNames").mockResolvedValueOnce(["super_admin"]);
      vi.spyOn(userRepo, "countActiveSuperadmins").mockResolvedValueOnce(1); // Exactly 1 remaining!

      const result = await updateUserAccountStatus(
        superAdminActor,
        "superadmin-uuid",
        "disabled"
      );

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/cannot disable the last active superadmin/i);
    });

    it("allows disabling a superadmin when other superadmins exist", async () => {
      vi.spyOn(userRepo, "findUserByPublicId").mockResolvedValueOnce({
        id: BigInt(99),
        publicId: "superadmin-uuid-2",
        email: "superadmin2@example.com",
        displayName: "Superadmin 2",
        auth0Subject: null,
        avatarUrl: null,
        isActive: true,
        status: "active",
        passwordHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.spyOn(userRepo, "getUserRoleNames").mockResolvedValueOnce(["super_admin"]);
      vi.spyOn(userRepo, "countActiveSuperadmins").mockResolvedValueOnce(2); // 2 exist!
      vi.spyOn(userRepo, "updateUser").mockResolvedValueOnce({} as userRepo.UserRecord);

      const result = await updateUserAccountStatus(
        superAdminActor,
        "superadmin-uuid-2",
        "disabled"
      );

      expect(result.success).toBe(true);
      expect(auditLogger.logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "user.disable",
        })
      );
    });
  });
});
