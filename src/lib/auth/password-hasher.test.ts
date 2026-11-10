import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { hashPassword, verifyPassword, computePepperedPreHash } from "./password-hasher";
import { getPepperByVersion } from "./pepper-service";

describe("password-hasher with peppered pre-hashing", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.PASSWORD_PEPPER_ACTIVE_VERSION = "v1";
    process.env.PASSWORD_PEPPER_V1 = "secret-pepper-key-for-test-32bytes!";
    process.env.PASSWORD_PEPPER_V2 = "different-secret-pepper-v2-32bytes!";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("computes deterministic HMAC-SHA256 pre-hash with pepper", () => {
    const h1 = computePepperedPreHash("my-password", "pepper1");
    const h2 = computePepperedPreHash("my-password", "pepper1");
    const h3 = computePepperedPreHash("my-password", "pepper2");

    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).toHaveLength(64); // SHA-256 hex string
  });

  it("throws if password or pepper is empty during pre-hash", () => {
    expect(() => computePepperedPreHash("", "pepper")).toThrow();
    expect(() => computePepperedPreHash("pwd", "")).toThrow();
  });

  it("generates an Argon2id formatted PHC string with active pepper version", async () => {
    const result = await hashPassword("super-secret-password-123");
    expect(result.pepperVersion).toBe("v1");
    expect(result.passwordHash).toMatch(
      /^\$argon2id\$v=19\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/
    );
  });

  it("ensures two hashes of the same password produce different unique salts", async () => {
    const r1 = await hashPassword("identical-password");
    const r2 = await hashPassword("identical-password");

    expect(r1.passwordHash).not.toBe(r2.passwordHash);
  });

  it("verifies correct password against hash using matching pepper version", async () => {
    const password = "admin-password-test!";
    const { passwordHash, pepperVersion } = await hashPassword(password);
    const isValid = await verifyPassword(password, passwordHash, pepperVersion);
    expect(isValid).toBe(true);
  });

  it("rejects incorrect password", async () => {
    const { passwordHash, pepperVersion } = await hashPassword("correct-password");
    const isValid = await verifyPassword("wrong-password", passwordHash, pepperVersion);
    expect(isValid).toBe(false);
  });

  it("rejects verification if wrong pepper version is supplied", async () => {
    const { passwordHash } = await hashPassword("admin-password", {
      pepper: process.env.PASSWORD_PEPPER_V1,
      pepperVersion: "v1",
    });

    // Attempting to verify v1 hash with v2 pepper must fail
    const isValid = await verifyPassword("admin-password", passwordHash, "v2");
    expect(isValid).toBe(false);
  });

  it("fails closed in production if required pepper version is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.PASSWORD_PEPPER_V99;

    expect(() => getPepperByVersion("v99")).toThrow(/Mandatory password pepper/i);
    vi.unstubAllEnvs();
  });
});
