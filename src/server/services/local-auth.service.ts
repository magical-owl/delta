import "server-only";

import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import { logAuditEvent } from "@/lib/audit/log-event";
import { verifyPassword } from "@/lib/auth/password-hasher";
import { checkRateLimit } from "@/lib/ratelimit/limiter";
import { findUserByEmail, getUserRoleNames } from "../dal/repositories/user.repository";
import { findUserCredentialByUserId } from "../dal/repositories/credential.repository";
import {
  createSessionRecord,
  findActiveSessionByTokenHash,
  revokeSessionByTokenHash,
} from "../dal/repositories/session.repository";

export const LOCAL_SESSION_COOKIE_NAME = "delta_local_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: {
    publicId: string;
    email: string;
    displayName: string;
    roles: string[];
  };
}

/**
 * Authenticates credentials against local PostgreSQL user and user_credentials.
 *
 * Requirements:
 * 1. Email and password input validation.
 * 2. Rate limiting (5 attempts / 15m / IP).
 * 3. Constant-time dummy verification mitigation against user enumeration.
 * 4. Resolves pepper version from credential record and verifies with peppered Argon2id.
 * 5. Fails closed on pending, disabled, or inactive accounts.
 * 6. Creates a high-entropy session in PostgreSQL.
 * 7. Sets HttpOnly, Secure, SameSite=Lax session cookie.
 * 8. Logs structured sanitized audit events.
 */
export async function authenticateLocalCredentials(
  email: string,
  password: string,
  clientIp?: string,
  userAgent?: string
): Promise<LoginResult> {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const ip = clientIp || "127.0.0.1";

  // 1. Rate limiting
  const rateLimit = await checkRateLimit({
    key: `ratelimit:local-login:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: "Too many login attempts. Please try again later.",
    };
  }

  // Generic failure message to prevent account enumeration
  const genericAuthFailure = {
    success: false,
    error: "Invalid email or password.",
  };

  if (!normalizedEmail || !password) {
    return genericAuthFailure;
  }

  // 2. Resolve user
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    // Timing mitigation: perform dummy verification so nonexistent accounts take similar processing time
    await verifyPassword(
      "dummy-password-for-timing",
      "$argon2id$v=19$m=65536,t=3,p=4$dummySalt$dummyHash",
      "v1"
    );
    return genericAuthFailure;
  }

  // 3. Resolve credential record
  const credential = await findUserCredentialByUserId(user.id);
  if (!credential) {
    // No local password credential (e.g. federated Auth0 account)
    await verifyPassword(
      "dummy-password-for-timing",
      "$argon2id$v=19$m=65536,t=3,p=4$dummySalt$dummyHash",
      "v1"
    );
    return genericAuthFailure;
  }

  // 4. Verify password with exact pepper version
  const isValid = await verifyPassword(
    password,
    credential.passwordHash,
    credential.pepperVersion
  );

  if (!isValid) {
    await logAuditEvent({
      actorUserId: user.id,
      action: "auth.login_failed",
      targetType: "User",
      targetPublicId: user.publicId,
      metadata: { reason: "invalid_password" },
      ipAddress: ip,
    });
    return genericAuthFailure;
  }

  // 5. Account status checks
  if (!user.isActive || user.status === "disabled") {
    await logAuditEvent({
      actorUserId: user.id,
      action: "auth.login_denied",
      targetType: "User",
      targetPublicId: user.publicId,
      metadata: { reason: "account_disabled" },
      ipAddress: ip,
    });
    return {
      success: false,
      error:
        "This account has been disabled. Please contact your workspace administrator.",
    };
  }

  if (user.status === "pending") {
    return {
      success: false,
      error:
        "This account is pending activation. Please accept your workspace invitation.",
    };
  }

  // 6. Create high-entropy database session
  const rawSessionToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawSessionToken).digest("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await createSessionRecord({
    userId: user.id,
    tokenHash,
    expiresAt,
    ipAddress: ip,
    userAgent,
  });

  // 7. Establish session cookie
  const cookieStore = await cookies();
  cookieStore.set(LOCAL_SESSION_COOKIE_NAME, rawSessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  // 8. Log successful login
  await logAuditEvent({
    actorUserId: user.id,
    action: "auth.login_success",
    targetType: "User",
    targetPublicId: user.publicId,
    ipAddress: ip,
  });

  const roles = await getUserRoleNames(user.id);

  return {
    success: true,
    user: {
      publicId: user.publicId,
      email: user.email,
      displayName: user.displayName,
      roles,
    },
  };
}

/**
 * Validates the database-backed session from cookie.
 */
export async function getLocalSessionUser() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(LOCAL_SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return null;

  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const session = await findActiveSessionByTokenHash(tokenHash);
  if (!session) return null;

  return session;
}

/**
 * Revokes the current local database session and clears the cookie.
 */
export async function revokeLocalSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(LOCAL_SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    await revokeSessionByTokenHash(tokenHash);
    cookieStore.delete(LOCAL_SESSION_COOKIE_NAME);
  }
}
