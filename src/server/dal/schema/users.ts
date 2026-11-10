import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userStatusEnum = ["active", "pending", "disabled"] as const;
export type UserStatus = (typeof userStatusEnum)[number];

export const users = pgTable("users", {
  id: bigint("id", { mode: "bigint" }).generatedAlwaysAsIdentity().primaryKey(),
  publicId: uuid("public_id").notNull().defaultRandom().unique(),
  auth0Subject: varchar("auth0_subject", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  /**
   * Account status:
   * - 'active': Fully enabled and authorized
   * - 'pending': Awaiting invitation acceptance / verification
   * - 'disabled': Administratively suspended; denied all protected operations
   */
  status: varchar("status", { length: 32 }).notNull().default("active"),
  /**
   * Password hash for initial local bootstrap superadmin (Argon2id compatible format)
   * Null for Auth0-managed federated users
   */
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
