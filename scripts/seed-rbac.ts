import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "../src/server/dal/schema";
import { Permission } from "../src/lib/rbac/permissions";
import { ROLE_DEFINITIONS } from "../src/lib/rbac/roles";

async function seed() {
  console.log("\n🌱 Seeding standard RBAC roles and permissions...");

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://delta:delta_dev_password@localhost:5432/delta",
  });
  const db = drizzle(pool, { schema });

  // 1. Seed Permissions
  console.log("  → Seeding permissions...");
  const permissionKeys = Object.values(Permission);
  const permissionIdMap = new Map<string, bigint>();

  for (const key of permissionKeys) {
    const existing = await db
      .select()
      .from(schema.permissions)
      .where(eq(schema.permissions.key, key))
      .limit(1);

    if (existing[0]) {
      permissionIdMap.set(key, existing[0].id);
    } else {
      const inserted = await db
        .insert(schema.permissions)
        .values({
          key,
          description: `Permission for ${key}`,
        })
        .returning();
      permissionIdMap.set(key, inserted[0]!.id);
    }
  }

  // 2. Seed Roles and Role-Permission mappings
  console.log("  → Seeding roles and role-permission mappings...");
  for (const [roleName, roleDef] of Object.entries(ROLE_DEFINITIONS)) {
    const existingRole = await db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.name, roleName))
      .limit(1);

    let roleId: bigint;
    if (existingRole[0]) {
      roleId = existingRole[0].id;
    } else {
      const insertedRole = await db
        .insert(schema.roles)
        .values({
          name: roleName,
          description: roleDef.description,
        })
        .returning();
      roleId = insertedRole[0]!.id;
    }

    // Bind permissions to role
    for (const permKey of roleDef.permissions) {
      const permId = permissionIdMap.get(permKey);
      if (permId) {
        await db
          .insert(schema.rolePermissions)
          .values({
            roleId,
            permissionId: permId,
          })
          .onConflictDoNothing();
      }
    }
  }

  await pool.end();
  console.log("✅ Standard RBAC roles and permissions seeded successfully.\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
