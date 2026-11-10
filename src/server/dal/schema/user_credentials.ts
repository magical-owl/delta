import { bigint, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userCredentials = pgTable(
  "user_credentials",
  {
    id: bigint("id", { mode: "bigint" }).generatedAlwaysAsIdentity().primaryKey(),
    userId: bigint("user_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /**
     * Encoded Argon2id verifier string including work factors and unique salt.
     * Calculated using HMAC-SHA256(pepper, password) as input.
     * Never stores raw passwords or reversible ciphertext.
     */
    passwordHash: text("password_hash").notNull(),
    /**
     * Active pepper version identifier (e.g. "v1").
     * Non-secret identifier indicating which secret key was used for HMAC pre-hashing.
     */
    pepperVersion: text("pepper_version").notNull().default("v1"),
    passwordChangedAt: timestamp("password_changed_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId)]
);

export type UserCredentialRecord = typeof userCredentials.$inferSelect;
export type InsertUserCredential = typeof userCredentials.$inferInsert;
