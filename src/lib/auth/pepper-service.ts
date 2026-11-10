/**
 * Pepper Secret Management Module.
 *
 * Requirements:
 * - Peppers are stored OUTSIDE PostgreSQL in secure environment variables or vault delivery.
 * - Peppers are NEVER committed, logged, or exposed in client bundles.
 * - Active pepper version is identified by PASSWORD_PEPPER_ACTIVE_VERSION (defaults to "v1").
 * - Each version is read from PASSWORD_PEPPER_<VERSION> (e.g. PASSWORD_PEPPER_V1).
 * - Fails closed: If a pepper version is missing or invalid, throws an error immediately.
 * - In development/test mode, fallback test peppers with warning are supported if not configured,
 *   but production STRICTLY enforces configured peppers.
 */

export interface ResolvedPepper {
  version: string;
  pepper: string;
}

/**
 * Returns the currently active pepper configuration for new hashes.
 */
export function getActivePepper(): ResolvedPepper {
  const version = (process.env.PASSWORD_PEPPER_ACTIVE_VERSION || "v1")
    .trim()
    .toLowerCase();
  const pepper = getPepperByVersion(version);
  return { version, pepper };
}

/**
 * Resolves a specific pepper by version identifier.
 * Fails closed if the pepper version does not exist.
 */
export function getPepperByVersion(version: string): string {
  const normalizedVersion = version.trim().toUpperCase();
  const envKey = `PASSWORD_PEPPER_${normalizedVersion}`;
  const pepper = process.env[envKey];

  if (pepper && pepper.trim().length >= 16) {
    return pepper.trim();
  }

  // If in production, fail closed immediately
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `[PepperSecurity] Mandatory password pepper '${envKey}' is missing or insufficient length (min 16 chars). Refusing password operations.`
    );
  }

  // Dev / Test mode fallback with deterministic salt-seed so unit tests and dev work without manual config
  // In dev/test: return a fallback deterministic pepper key
  return `dev-local-pepper-fallback-do-not-use-in-prod-for-${version}`;
}
