import { createHash, randomBytes } from "crypto";

/**
 * Token digestion & entropy helpers for invitations and activations.
 * High-entropy random tokens are hashed with SHA-256 before storage.
 */

export interface GeneratedInvitationToken {
  /** Raw high-entropy token to be delivered securely via email. Never log or store. */
  rawToken: string;
  /** SHA-256 hex digest for secure database persistence */
  tokenHash: string;
}

/**
 * Generates a 256-bit (32-byte) cryptographically secure random token
 * and its corresponding SHA-256 hex digest.
 */
export function generateInvitationToken(): GeneratedInvitationToken {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Computes the SHA-256 digest of a raw token string.
 */
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
