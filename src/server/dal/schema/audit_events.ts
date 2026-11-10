import { bigint, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { users } from "./users";

export const auditEvents = pgTable("audit_events", {
  id: bigint("id", { mode: "bigint" }).generatedAlwaysAsIdentity().primaryKey(),
  actorUserId: bigint("actor_user_id", { mode: "bigint" }).references(() => users.id, {
    onDelete: "set null",
  }),
  action: varchar("action", { length: 200 }).notNull(),
  targetType: varchar("target_type", { length: 100 }),
  targetPublicId: uuid("target_public_id"),
  /**
   * Arbitrary JSON payload for the event.
   * NEVER store passwords, tokens, or secrets in this field.
   */
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AuditEventInsert = typeof auditEvents.$inferInsert;
