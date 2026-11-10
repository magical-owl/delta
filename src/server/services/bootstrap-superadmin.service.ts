import "server-only";

import { logAuditEvent } from "@/lib/audit/log-event";
import { hashPassword } from "@/lib/auth/password-hasher";
import { getActivePepper } from "@/lib/auth/pepper-service";
import {
  assignUserRole,
  countActiveSuperadmins,
  createUser,
  findUserByEmail,
  type UserSummaryDTO,
} from "../dal/repositories/user.repository";
import { createUserCredential } from "../dal/repositories/credential.repository";

export interface BootstrapSuperadminInput {
  email: string;
  displayName: string;
  password: string;
}

export interface BootstrapResult {
  success: boolean;
  message: string;
  user?: Partial<UserSummaryDTO>;
}

/**
 * Superadmin Explicit Bootstrap Procedure.
 *
 * Requirements:
 * - Requires deliberate manual execution via `pnpm auth:bootstrap-superadmin` or scripted CLI.
 * - Never runs automatically on application startup.
 * - Validates that an active pepper secret exists outside PostgreSQL.
 * - Accepts administrator-supplied credentials securely.
 * - Hashes passwords using Argon2id with unique salt and HMAC-SHA256 secret pepper.
 * - Creates user account and separate user_credentials record.
 * - Refuses duplicate provisioning when a superadmin already exists or account email conflicts.
 * - Assigns the Superadmin role.
 * - Records an audit event.
 * - Never logs or exposes plaintext passwords, HMAC intermediates, or peppers.
 */
export async function bootstrapSuperadmin(
  input: BootstrapSuperadminInput
): Promise<BootstrapResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { success: false, message: "Valid email address is required." };
  }

  if (!input.password || input.password.length < 12) {
    return {
      success: false,
      message: "Password must be at least 12 characters long.",
    };
  }

  // 1. Confirm usable pepper secret exists
  try {
    getActivePepper();
  } catch (err: unknown) {
    return {
      success: false,
      message: `Pepper configuration error: ${
        err instanceof Error ? err.message : "Active pepper secret not configured."
      }`,
    };
  }

  // 2. Prevent duplicate superadmin provisioning if one already exists
  const existingSuperadminCount = await countActiveSuperadmins();
  if (existingSuperadminCount > 0) {
    return {
      success: false,
      message:
        "Refused: A Superadmin account is already provisioned. Use the admin management dashboard to invite or configure additional administrators.",
    };
  }

  // 3. Check for conflicting email
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      message: "Refused: An account with this email address already exists.",
    };
  }

  // 4. Hash password with Argon2id + HMAC secret pepper
  const { passwordHash, pepperVersion } = await hashPassword(input.password);

  // 5. Create initial active Superadmin account
  const superadminUser = await createUser({
    email,
    displayName: input.displayName.trim() || "Initial Superadmin",
    status: "active",
    isActive: true,
  });

  // 6. Create dedicated credential record
  await createUserCredential({
    userId: superadminUser.id,
    passwordHash,
    pepperVersion,
  });

  // 7. Assign super_admin role
  await assignUserRole(superadminUser.id, "super_admin");

  // 8. Record audit event
  await logAuditEvent({
    actorUserId: superadminUser.id,
    action: "system.bootstrap_superadmin",
    targetType: "User",
    targetPublicId: superadminUser.publicId,
    metadata: {
      email: superadminUser.email,
      pepperVersion,
      procedure: "auth:bootstrap-superadmin",
    },
  });

  return {
    success: true,
    message: "Superadmin successfully bootstrapped with peppered Argon2id credentials.",
    user: {
      publicId: superadminUser.publicId,
      email: superadminUser.email,
      displayName: superadminUser.displayName,
      status: superadminUser.status,
    },
  };
}
