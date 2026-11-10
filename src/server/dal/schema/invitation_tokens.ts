import { bigint, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const invitationTokens = pgTable("invitation_tokens", {
  id: bigint("id", { mode: "bigint" }).generatedAlwaysAsIdentity().primaryKey(),
  userId: bigint("user_id", { mode: "bigint" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /**
   * SHA-256 digest of the raw high-entropy invitation token.
   * Raw tokens are NEVER stored in plaintext.
   */
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
