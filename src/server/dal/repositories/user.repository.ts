import "server-only";

import { count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "../db";
import { externalIdentities, roles, userRoles, users, type UserStatus } from "../schema";

// ---------------------------------------------------------------------------
// Types inferred from schema
// ---------------------------------------------------------------------------

export type UserRecord = typeof users.$inferSelect;
export type CreateUserData = {
  email: string;
  displayName: string;
  auth0Subject?: string;
  avatarUrl?: string;
  status?: UserStatus;
  isActive?: boolean;
  passwordHash?: string;
};
export type UpdateUserData = Partial<
  Pick<UserRecord, "displayName" | "avatarUrl" | "isActive" | "status" | "updatedAt">
>;

export interface UserSummaryDTO {
  publicId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  isActive: boolean;
  status: string;
  roles: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Repository functions
// ---------------------------------------------------------------------------

/**
 * Find a user by their email address.
 */
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Find a user by their Auth0 subject (sub claim from JWT).
 * Returns null when no matching user exists.
 */
export async function findUserByAuth0Subject(
  subject: string
): Promise<UserRecord | null> {
  const result = await db
    .select({ user: users })
    .from(users)
    .innerJoin(externalIdentities, eq(externalIdentities.userId, users.id))
    .where(eq(externalIdentities.providerSubject, subject))
    .limit(1);

  return result[0]?.user ?? null;
}

/**
 * Find a user by their UUID public identifier.
 * Returns null when no matching user exists.
 */
export async function findUserByPublicId(publicId: string): Promise<UserRecord | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.publicId, publicId))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Find a user by their internal bigint primary key.
 * Returns null when no matching user exists.
 */
export async function findUserById(id: bigint): Promise<UserRecord | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? null;
}

/**
 * Fetch role names assigned to a given user id.
 */
export async function getUserRoleNames(userId: bigint): Promise<string[]> {
  const rows = await db
    .select({ roleName: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  return rows.map((r) => r.roleName);
}

/**
 * Count active users possessing the super_admin role.
 */
export async function countActiveSuperadmins(): Promise<number> {
  const rows = await db
    .select({ count: count() })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(users, eq(userRoles.userId, users.id))
    .where(eq(roles.name, "super_admin"));

  return Number(rows[0]?.count ?? 0);
}

/**
 * List users with search and pagination, returning safe public DTOs (no internal BIGINTs).
 */
export async function listUsersSafe(options: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: UserSummaryDTO[]; total: number }> {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  const conditions = options.search
    ? or(
        ilike(users.email, `%${options.search}%`),
        ilike(users.displayName, `%${options.search}%`)
      )
    : undefined;

  const baseQuery = conditions
    ? db.select().from(users).where(conditions)
    : db.select().from(users);

  const userList = await baseQuery
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  const countRows = await (conditions
    ? db.select({ total: count() }).from(users).where(conditions)
    : db.select({ total: count() }).from(users));

  const total = Number(countRows[0]?.total ?? 0);

  // Map to safe DTOs with their assigned roles
  const dtos: UserSummaryDTO[] = [];
  for (const u of userList) {
    const userRoleList = await getUserRoleNames(u.id);
    dtos.push({
      publicId: u.publicId,
      email: u.email,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      isActive: u.isActive,
      status: u.status,
      roles: userRoleList,
      createdAt: u.createdAt.toISOString(),
    });
  }

  return { users: dtos, total };
}

/**
 * Persist a new user record.
 * The database assigns the internal ID; callers receive the full record.
 */
export async function createUser(data: CreateUserData): Promise<UserRecord> {
  const rows = await db
    .insert(users)
    .values({
      email: data.email.trim().toLowerCase(),
      displayName: data.displayName.trim(),
      auth0Subject: data.auth0Subject,
      avatarUrl: data.avatarUrl ?? null,
      status: data.status ?? "active",
      isActive: data.isActive ?? true,
      passwordHash: data.passwordHash ?? null,
    })
    .returning();

  if (!rows[0]) {
    throw new Error("[UserRepository] INSERT did not return the created user record.");
  }

  return rows[0];
}

/**
 * Assign a role to a user by role name.
 */
export async function assignUserRole(userId: bigint, roleName: string): Promise<void> {
  const roleRows = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);

  let roleId = roleRows[0]?.id;
  if (!roleId) {
    // Insert role if not present
    const inserted = await db.insert(roles).values({ name: roleName }).returning();
    roleId = inserted[0]!.id;
  }

  await db
    .insert(userRoles)
    .values({
      userId,
      roleId,
    })
    .onConflictDoNothing();
}

/**
 * Remove a specific role from a user.
 */
export async function removeUserRole(userId: bigint, roleName: string): Promise<void> {
  const roleRows = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);

  if (!roleRows[0]) return;

  await db.delete(userRoles).where(eq(userRoles.userId, userId));
}

/**
 * Update mutable fields on an existing user record.
 * Returns the updated record, or null if the user was not found.
 */
export async function updateUser(
  id: bigint,
  data: UpdateUserData
): Promise<UserRecord | null> {
  const rows = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return rows[0] ?? null;
}
