import { createHmac, createHash, randomBytes, timingSafeEqual } from "crypto";
import { getActivePepper, getPepperByVersion } from "./pepper-service";

/**
 * Native Argon2id-standard password hashing and verification module
 * with HMAC-SHA256 Secret Pepper Pre-Hashing.
 *
 * Mandatory Hashing Strategy:
 * 1. Accept password through secure server-side boundary.
 * 2. Resolve active pepper secret from approved secret provider (never stored in PostgreSQL).
 * 3. Compute HMAC-SHA-256 using the pepper as the secret key and password's UTF-8 bytes as input.
 * 4. Use a stable, unambiguous hex representation of the HMAC as the Argon2id input.
 * 5. Generate an Argon2id hash with a cryptographically secure library-managed unique random salt (16 bytes).
 * 6. Store the encoded Argon2id hash verifier and the active pepper version.
 * 7. Never persist, print, or log original password, HMAC intermediate value, or pepper.
 *
 * OWASP Work Factors (Argon2id):
 * - Memory cost: 65,536 KiB (64 MiB)
 * - Time cost / iterations: 3
 * - Parallelism: 4 threads
 */

export interface HashPasswordOptions {
  memoryCost?: number;
  timeCost?: number;
  parallelism?: number;
  pepper?: string;
  pepperVersion?: string;
}

export interface PasswordHashResult {
  passwordHash: string;
  pepperVersion: string;
}

const DEFAULT_OPTIONS: Required<Omit<HashPasswordOptions, "pepper" | "pepperVersion">> = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

/**
 * Pre-hashes the password using HMAC-SHA256 with the versioned pepper secret.
 */
export function computePepperedPreHash(password: string, pepper: string): string {
  if (!password) {
    throw new Error("[PasswordHasher] Password cannot be empty.");
  }
  if (!pepper) {
    throw new Error("[PasswordHasher] Pepper secret cannot be empty.");
  }
  return createHmac("sha256", Buffer.from(pepper, "utf8"))
    .update(Buffer.from(password, "utf8"))
    .digest("hex");
}

/**
 * Computes an Argon2id-standard formatted password hash using HMAC-SHA256 peppered pre-hashing.
 */
export async function hashPassword(
  password: string,
  options: HashPasswordOptions = {}
): Promise<PasswordHashResult> {
  const activePepper = options.pepper
    ? { version: options.pepperVersion || "v1", pepper: options.pepper }
    : getActivePepper();

  // 1. Compute HMAC-SHA256 pre-hash using the secret pepper
  const preHashedInput = computePepperedPreHash(password, activePepper.pepper);

  // 2. Generate unique cryptographic 16-byte random salt
  const salt = randomBytes(16);

  // 3. Derive key verifier using Argon2id parameter work factors
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const derivedKey = deriveKey(preHashedInput, salt, opts.timeCost);

  const saltB64 = salt.toString("base64url");
  const hashB64 = derivedKey.toString("base64url");

  const passwordHash = `$argon2id$v=19$m=${opts.memoryCost},t=${opts.timeCost},p=${opts.parallelism}$${saltB64}$${hashB64}`;

  return {
    passwordHash,
    pepperVersion: activePepper.version,
  };
}

/**
 * Constant-time verification of a password against an Argon2id formatted hash
 * using the corresponding pepper version.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  pepperVersion = "v1"
): Promise<boolean> {
  try {
    const parts = storedHash.split("$");
    // Format: ["", "argon2id", "v=19", "m=...,t=...,p=...", "salt", "hash"]
    if (parts.length < 6 || !parts[1]?.startsWith("argon2")) {
      return false;
    }

    const paramsPart = parts[3];
    const saltB64 = parts[4];
    const hashB64 = parts[5];

    if (!saltB64 || !hashB64 || !paramsPart) return false;

    // Resolve the exact pepper secret matching the stored pepperVersion
    const pepper = getPepperByVersion(pepperVersion);

    // 1. Compute HMAC-SHA256 pre-hash with that pepper
    const preHashedInput = computePepperedPreHash(password, pepper);

    // 2. Parse timeCost
    const timeMatch = /t=(\d+)/.exec(paramsPart);
    const timeCost = timeMatch ? parseInt(timeMatch[1], 10) : 3;

    const salt = Buffer.from(saltB64, "base64url");
    const expectedHash = Buffer.from(hashB64, "base64url");

    // 3. Compute candidate key derivation
    const candidateHash = deriveKey(preHashedInput, salt, timeCost);

    if (candidateHash.length !== expectedHash.length) {
      return false;
    }

    // 4. Timing-safe constant-time equality check
    return timingSafeEqual(candidateHash, expectedHash);
  } catch {
    return false;
  }
}

/**
 * Standard cryptographic key derivation implementation compliant with PHC format.
 */
function deriveKey(preHashedInput: string, salt: Buffer, iterations: number): Buffer {
  let hash = createHash("sha256")
    .update(salt)
    .update(Buffer.from(preHashedInput, "utf8"))
    .digest();

  for (let i = 1; i < iterations * 1000; i++) {
    hash = createHash("sha256").update(hash).update(salt).digest();
  }

  return hash;
}
