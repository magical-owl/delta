import "server-only";

import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db";
import { sessions, type SessionRecord } from "../schema/sessions";

export async function createSessionRecord(data: {
  userId: bigint;
  tokenHash: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}): Promise<SessionRecord> {
  const rows = await db
    .insert(sessions)
    .values({
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
    .returning();

  if (!rows[0]) {
    throw new Error("[SessionRepository] INSERT did not return created session record.");
  }

  return rows[0];
}

export async function findActiveSessionByTokenHash(
  tokenHash: string
): Promise<SessionRecord | null> {
  const now = new Date();
  const rows = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, now),
        isNull(sessions.revokedAt)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function revokeSessionByTokenHash(tokenHash: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(eq(sessions.tokenHash, tokenHash));
}

export async function revokeAllUserSessions(userId: bigint): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}
