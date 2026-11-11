"use server";

import { redirect } from "next/navigation";
import { revokeLocalSession } from "@/server/services/local-auth.service";

/**
 * Server Action — revokes the database-backed session, clears the
 * session cookie, and redirects the user to the login page.
 *
 * Because `redirect` throws a control-flow exception it must be
 * called after revocation completes.
 */
export async function logoutAction(): Promise<never> {
  await revokeLocalSession();
  redirect("/login");
}
