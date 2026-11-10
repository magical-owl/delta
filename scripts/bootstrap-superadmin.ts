import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { count, eq } from "drizzle-orm";
import * as schema from "../src/server/dal/schema";
import { hashPassword } from "../src/lib/auth/password-hasher";
import * as readline from "readline";

async function prompt(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (!hidden) {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    } else {
      process.stdout.write(question);
      const stdin = process.stdin;
      const oldRaw = stdin.isRaw;
      if (stdin.setRawMode) stdin.setRawMode(true);
      stdin.resume();

      let input = "";
      const onData = (char: Buffer) => {
        const c = char.toString();
        if (c === "\n" || c === "\r" || c === "\u0004") {
          stdin.removeListener("data", onData);
          if (stdin.setRawMode) stdin.setRawMode(oldRaw || false);
          stdin.pause();
          process.stdout.write("\n");
          rl.close();
          resolve(input.trim());
        } else if (c === "\u0008" || c === "\u007f") {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else if (c === "\u0003") {
          process.exit(1);
        } else {
          input += c;
          process.stdout.write("*");
        }
      };

      stdin.on("data", onData);
    }
  });
}

async function main() {
  console.log("\n=== Explicit Superadmin Provisioning Bootstrap ===");
  console.log("This command creates the initial workspace Superadmin.");
  console.log("It cannot be run once an active Superadmin exists.\n");

  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://delta:delta_dev_password@localhost:5432/delta",
  });
  const db = drizzle(pool, { schema });

  const emailInput =
    process.env.BOOTSTRAP_SUPERADMIN_EMAIL || (await prompt("Superadmin Email: "));
  const displayNameInput =
    process.env.BOOTSTRAP_SUPERADMIN_NAME || (await prompt("Display Name: "));
  const passwordInput =
    process.env.BOOTSTRAP_SUPERADMIN_PASSWORD ||
    (await prompt("Superadmin Password (min 12 chars): ", true));

  const email = emailInput.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    console.error("[ERROR] Valid email address is required.");
    process.exit(1);
  }

  if (!passwordInput || passwordInput.length < 12) {
    console.error("[ERROR] Password must be at least 12 characters long.");
    process.exit(1);
  }

  // 1. Check if superadmin already exists
  const superadminRows = await db
    .select({ count: count() })
    .from(schema.userRoles)
    .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
    .where(eq(schema.roles.name, "super_admin"));

  if (Number(superadminRows[0]?.count ?? 0) > 0) {
    console.error(
      "\n[REFUSED] A Superadmin account is already provisioned in the database."
    );
    process.exit(1);
  }

  // 2. Check if email conflicts
  const existingUser = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (existingUser[0]) {
    console.error(`\n[REFUSED] An account with email '${email}' already exists.`);
    process.exit(1);
  }

  // 3. Hash password using Argon2id + HMAC secret pepper
  const { passwordHash, pepperVersion } = await hashPassword(passwordInput);

  // 4. Create user
  const newUsers = await db
    .insert(schema.users)
    .values({
      email,
      displayName: displayNameInput.trim() || "Initial Superadmin",
      status: "active",
      isActive: true,
    })
    .returning();

  const user = newUsers[0]!;

  // 5. Create user_credentials record
  await db.insert(schema.userCredentials).values({
    userId: user.id,
    passwordHash,
    pepperVersion,
    passwordChangedAt: new Date(),
  });

  // 6. Assign super_admin role
  const roleRows = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.name, "super_admin"))
    .limit(1);

  let roleId = roleRows[0]?.id;
  if (!roleId) {
    const inserted = await db
      .insert(schema.roles)
      .values({
        name: "super_admin",
        description: "Full system access",
      })
      .returning();
    roleId = inserted[0]!.id;
  }

  await db
    .insert(schema.userRoles)
    .values({
      userId: user.id,
      roleId,
    })
    .onConflictDoNothing();

  // 7. Record audit event
  await db.insert(schema.auditEvents).values({
    actorUserId: user.id,
    action: "system.bootstrap_superadmin",
    targetType: "User",
    targetPublicId: user.publicId,
    metadata: {
      email: user.email,
      procedure: "auth:bootstrap-superadmin",
      pepperVersion,
    },
  });

  await pool.end();

  console.log("\n[SUCCESS] Superadmin successfully bootstrapped!");
  console.log(`Public ID:       ${user.publicId}`);
  console.log(`Email:           ${user.email}`);
  console.log(`Pepper Version:  ${pepperVersion}`);
  console.log("Superadmin role assigned successfully.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nUnexpected error during Superadmin bootstrap:", err);
  process.exit(1);
});
