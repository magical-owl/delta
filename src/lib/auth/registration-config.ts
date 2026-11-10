/**
 * Evaluates whether public self-registration is enabled.
 * Default is FALSE unless explicitly set to "true".
 * Missing, malformed, or unrecognized values fail closed to false.
 */
export function isPublicRegistrationEnabled(): boolean {
  const val = process.env.ENABLE_PUBLIC_REGISTRATION;
  if (!val) return false;
  return val.trim().toLowerCase() === "true";
}
