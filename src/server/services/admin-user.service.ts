import "server-only";

import { logAuditEvent } from "@/lib/audit/log-event";
import { generateInvitationToken } from "@/lib/auth/invitation-tokens";
import { Permission } from "@/lib/rbac/permissions";
import {
  assignUserRole,
  countActiveSuperadmins,
  createUser,
  findUserByEmail,
  findUserByPublicId,
  getUserRoleNames,
  updateUser,
  type UserSummaryDTO,
} from "../dal/repositories/user.repository";
import { createInvitationTokenRecord } from "../dal/repositories/invitation.repository";
import type { CreateUserInput } from "@/lib/validation/user-management.schema";

export interface ProvisionUserResult {
  success: boolean;
  user?: UserSummaryDTO;
  error?: string;
  invitationStatus?: "generated" | "email_unconfigured";
}

export interface AdminActorContext {
  userId: bigint;
  userPublicId: string;
  email: string;
  permissions: string[];
}

/**
 * Administrative User Provisioning Service.
 *
 * Enforces:
 * 1. Actor verification with users:create permission
 * 2. Role escalation safeguards (Ordinary admins cannot assign super_admin)
 * 3. Conflict detection on duplicate accounts
 * 4. Safe public DTO return with UUIDv4, hiding internal BIGINT ID
 * 5. High-entropy invitation token generation (digest stored, raw token not logged)
 * 6. Structured audit event generation
 */
export async function provisionUserByAdmin(
  actor: AdminActorContext,
  input: CreateUserInput,
  ipAddress?: string
): Promise<ProvisionUserResult> {
  // 1. Permission check
  const hasCreate =
    actor.permissions.includes(Permission.ADMIN_ALL) ||
    actor.permissions.includes(Permission.USERS_CREATE) ||
    actor.permissions.includes(Permission.USERS_WRITE);

  if (!hasCreate) {
    return {
      success: false,
      error: "Unauthorized: Missing 'users:create' permission.",
    };
  }

  // 2. Role escalation safeguard: Ordinary admins cannot grant super_admin
  const requestedRole = input.role.toLowerCase();
  const isSuperAdminActor = actor.permissions.includes(Permission.ADMIN_ALL);

  if (requestedRole === "super_admin" && !isSuperAdminActor) {
    return {
      success: false,
      error: "Unauthorized: Only Superadmins can assign the Superadmin role.",
    };
  }

  // 3. Conflict detection
  const existing = await findUserByEmail(input.email);
  if (existing) {
    return {
      success: false,
      error: "An account with this email address already exists.",
    };
  }

  // 4. Create user in pending state if invitation workflow is used
  const userStatus = input.sendInvitation ? "pending" : "active";
  const newUser = await createUser({
    email: input.email,
    displayName: input.displayName,
    status: userStatus,
    isActive: true,
  });

  // 5. Assign authorized role
  await assignUserRole(newUser.id, requestedRole);

  // 6. Generate invitation token if requested
  let invitationStatus: "generated" | "email_unconfigured" | undefined;
  if (input.sendInvitation) {
    const { tokenHash } = generateInvitationToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

    await createInvitationTokenRecord({
      userId: newUser.id,
      tokenHash,
      expiresAt,
    });

    // Check if secure email delivery service is configured
    const emailConfigured = Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY);
    invitationStatus = emailConfigured ? "generated" : "email_unconfigured";

    // Note: rawToken is intentionally NOT logged or returned via ordinary API response
  }

  // 7. Audit log event
  await logAuditEvent({
    actorUserId: actor.userId,
    action: "user.admin_provision",
    targetType: "User",
    targetPublicId: newUser.publicId,
    metadata: {
      email: newUser.email,
      assignedRole: requestedRole,
      status: userStatus,
      invitationIssued: input.sendInvitation,
    },
    ipAddress,
  });

  const roles = await getUserRoleNames(newUser.id);

  return {
    success: true,
    invitationStatus,
    user: {
      publicId: newUser.publicId,
      email: newUser.email,
      displayName: newUser.displayName,
      avatarUrl: newUser.avatarUrl,
      isActive: newUser.isActive,
      status: newUser.status,
      roles,
      createdAt: newUser.createdAt.toISOString(),
    },
  };
}

/**
 * Update user account status (active vs disabled).
 * Enforces Last-Superadmin protection.
 */
export async function updateUserAccountStatus(
  actor: AdminActorContext,
  targetPublicId: string,
  newStatus: "active" | "disabled",
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  const hasPermission =
    actor.permissions.includes(Permission.ADMIN_ALL) ||
    actor.permissions.includes(Permission.USERS_WRITE);

  if (!hasPermission) {
    return {
      success: false,
      error: "Unauthorized: Missing permissions to update account status.",
    };
  }

  const targetUser = await findUserByPublicId(targetPublicId);
  if (!targetUser) {
    return { success: false, error: "User not found." };
  }

  // Last-Superadmin Protection:
  // Cannot disable or deactivate the last remaining active superadmin
  if (newStatus === "disabled") {
    const targetRoles = await getUserRoleNames(targetUser.id);
    if (targetRoles.includes("super_admin")) {
      const superAdminCount = await countActiveSuperadmins();
      if (superAdminCount <= 1) {
        return {
          success: false,
          error:
            "Protected: Cannot disable the last active Superadmin account. Promote another Superadmin first.",
        };
      }
    }
  }

  await updateUser(targetUser.id, {
    status: newStatus,
    isActive: newStatus === "active",
  });

  await logAuditEvent({
    actorUserId: actor.userId,
    action: newStatus === "disabled" ? "user.disable" : "user.enable",
    targetType: "User",
    targetPublicId: targetUser.publicId,
    metadata: {
      email: targetUser.email,
      status: newStatus,
    },
    ipAddress,
  });

  return { success: true };
}
