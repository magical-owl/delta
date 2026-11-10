import { bigint, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: bigint("id", { mode: "bigint" }).generatedAlwaysAsIdentity().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
