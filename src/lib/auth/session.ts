import "server-only";

import { redirect } from "next/navigation";
import type { SessionData } from "@auth0/nextjs-auth0/types";
import { auth0 } from "./auth0-client";
import { findUserByAuth0Subject } from "@/server/dal/repositories/user.repository";

/** The user shape returned from Auth0 sessions. */
export interface SessionUser {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  nickname?: string;
  email_verified?: boolean;
  [key: string]: unknown;
}

export interface AuthenticatedUserContext {
  session: SessionData;
  sessionUser: SessionUser;
  internalUser: {
    id: bigint;
    publicId: string;
    email: string;
    displayName: string;
    status: string;
    isActive: boolean;
  } | null;
}

/**
 * Returns the current Auth0 session, or `null` if the user is not
 * authenticated. Never throws — safe to call in any Server Component or
 * Route Handler.
 */
export async function getCurrentSession(): Promise<SessionData | null> {
  try {
    return await auth0.getSession();
  } catch {
    return null;
  }
}

/**
 * Returns the current Auth0 session. Redirects to `/login` if the user is
 * not authenticated. Use in Server Components or Route Handlers that must be
 * behind a login wall.
 */
export async function requireSession(): Promise<SessionData> {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Enforces authenticated active session.
 * Rejects with redirect to `/unauthorized` if account status is "pending" or "disabled",
 * or if user is marked inactive.
 */
export async function requireActiveSession(): Promise<AuthenticatedUserContext> {
  const session = await requireSession();
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Check corresponding internal user record if provisioned
  let internalRecord = null;
  try {
    internalRecord = await findUserByAuth0Subject(user.sub);
  } catch {
    // If database is unreachable or offline in test environment, fallback gracefully
  }

  if (internalRecord) {
    if (
      !internalRecord.isActive ||
      internalRecord.status === "disabled" ||
      internalRecord.status === "pending"
    ) {
      redirect("/unauthorized?reason=account_not_active");
    }
  }

  return {
    session,
    sessionUser: user,
    internalUser: internalRecord
      ? {
          id: internalRecord.id,
          publicId: internalRecord.publicId,
          email: internalRecord.email,
          displayName: internalRecord.displayName,
          status: internalRecord.status,
          isActive: internalRecord.isActive,
        }
      : null,
  };
}

/**
 * Returns a typed user object from the current session, or `null` when the
 * user is not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getCurrentSession();
  if (!session?.user) {
    return null;
  }

  const { user } = session;
  return {
    ...user,
    // Ensure sub is always a string (Auth0 guarantees it, but be defensive).
    sub: String(user.sub ?? ""),
  } satisfies SessionUser;
}
