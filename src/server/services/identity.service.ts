import "server-only";

import { eq } from "drizzle-orm";

import { db } from "../dal/db";
import { externalIdentities } from "../dal/schema";
import {
  createUser,
  findUserByAuth0Subject,
  type UserRecord,
} from "../dal/repositories/user.repository";

export interface Auth0UserClaims {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

/**
 * Idempotent identity provisioning.
 *
 * Given Auth0 claims, finds or creates the internal user record and
 * ensures an external_identity row exists linking auth0 → internal user.
 *
 * This is the ONLY place Auth0 subjects are translated to internal users.
 * Never call this from client components or non-server paths.
 */
export async function provisionUser(claims: Auth0UserClaims): Promise<UserRecord> {
  // 1. Try to find an existing user via external_identities join.
  const existingUser = await findUserByAuth0Subject(claims.sub);
  if (existingUser) {
    return existingUser;
  }

  // 2. No existing link — create the user record.
  const newUser = await createUser({
    email: claims.email,
    displayName: claims.name ?? claims.email,
    auth0Subject: claims.sub,
    avatarUrl: claims.picture,
  });

  // 3. Record the external identity link.
  await db
    .insert(externalIdentities)
    .values({
      userId: newUser.id,
      provider: "auth0",
      providerSubject: claims.sub,
    })
    .onConflictDoNothing();

  return newUser;
}

/**
 * Unlinks an Auth0 identity from an internal user.
 * Does NOT delete the internal user record.
 */
export async function unlinkAuth0Identity(subject: string): Promise<void> {
  await db
    .delete(externalIdentities)
    .where(eq(externalIdentities.providerSubject, subject));
}
