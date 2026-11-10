import "server-only";

import { and, eq, gt } from "drizzle-orm";
import { db } from "../db";
import { invitationTokens } from "../schema";

export async function createInvitationTokenRecord(data: {
  userId: bigint;
  tokenHash: string;
  expiresAt: Date;
}) {
  const rows = await db
    .insert(invitationTokens)
    .values({
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
    })
    .returning();

  return rows[0] ?? null;
}

export async function findValidInvitationToken(tokenHash: string) {
  const now = new Date();
  const rows = await db
    .select()
    .from(invitationTokens)
    .where(
      and(eq(invitationTokens.tokenHash, tokenHash), gt(invitationTokens.expiresAt, now))
    )
    .limit(1);

  const token = rows[0];
  if (!token || token.usedAt !== null) {
    return null;
  }

  return token;
}

export async function markInvitationTokenUsed(id: bigint) {
  await db
    .update(invitationTokens)
    .set({ usedAt: new Date() })
    .where(eq(invitationTokens.id, id));
}
