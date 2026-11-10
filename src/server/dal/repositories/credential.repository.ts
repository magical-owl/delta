import "server-only";

import { eq } from "drizzle-orm";
import { db } from "../db";
import { userCredentials, type UserCredentialRecord } from "../schema/user_credentials";

export async function findUserCredentialByUserId(
  userId: bigint
): Promise<UserCredentialRecord | null> {
  const rows = await db
    .select()
    .from(userCredentials)
    .where(eq(userCredentials.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

export async function createUserCredential(data: {
  userId: bigint;
  passwordHash: string;
  pepperVersion: string;
}): Promise<UserCredentialRecord> {
  const rows = await db
    .insert(userCredentials)
    .values({
      userId: data.userId,
      passwordHash: data.passwordHash,
      pepperVersion: data.pepperVersion,
      passwordChangedAt: new Date(),
    })
    .returning();

  if (!rows[0]) {
    throw new Error("[CredentialRepository] INSERT did not return credential record.");
  }

  return rows[0];
}

export async function updateUserCredential(
  userId: bigint,
  data: {
    passwordHash: string;
    pepperVersion: string;
  }
): Promise<UserCredentialRecord | null> {
  const rows = await db
    .update(userCredentials)
    .set({
      passwordHash: data.passwordHash,
      pepperVersion: data.pepperVersion,
      passwordChangedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userCredentials.userId, userId))
    .returning();

  return rows[0] ?? null;
}
