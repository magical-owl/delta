import { bigint, pgTable, unique } from "drizzle-orm/pg-core";

import { permissions } from "./permissions";
import { roles } from "./roles";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: bigint("id", { mode: "bigint" }).generatedAlwaysAsIdentity().primaryKey(),
    roleId: bigint("role_id", { mode: "bigint" })
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: bigint("permission_id", { mode: "bigint" })
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [unique().on(t.roleId, t.permissionId)]
);
