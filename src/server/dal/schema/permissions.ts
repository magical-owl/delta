import { bigint, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const permissions = pgTable("permissions", {
  id: bigint("id", { mode: "bigint" }).generatedAlwaysAsIdentity().primaryKey(),
  key: varchar("key", { length: 200 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
