/**
 * Determines whether a target navigation href is currently active based on current pathname.
 * Handles exact matching vs. nested route prefix matching, while preventing false-positive
 * substring collisions (e.g., `/dashboard/user` must not match `/dashboard/users`).
 */
export function isActiveRoute(
  currentPath: string,
  targetHref: string,
  exactMatch: boolean = false
): boolean {
  if (!currentPath || !targetHref) return false;

  // Normalize by stripping query strings and trailing slashes (except root '/')
  const normalizedCurrent = currentPath.split("?")[0].replace(/\/+$/, "") || "/";
  const normalizedTarget = targetHref.split("?")[0].replace(/\/+$/, "") || "/";

  if (exactMatch || normalizedTarget === "/") {
    return normalizedCurrent === normalizedTarget;
  }

  // Exact match always qualifies
  if (normalizedCurrent === normalizedTarget) {
    return true;
  }

  // Nested match: target must be followed by a path separator '/'
  return normalizedCurrent.startsWith(`${normalizedTarget}/`);
}
