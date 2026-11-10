import { describe, expect, it, afterEach } from "vitest";
import { isPublicRegistrationEnabled } from "./registration-config";

describe("isPublicRegistrationEnabled", () => {
  const originalEnv = process.env.ENABLE_PUBLIC_REGISTRATION;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.ENABLE_PUBLIC_REGISTRATION = originalEnv;
    } else {
      delete process.env.ENABLE_PUBLIC_REGISTRATION;
    }
  });

  it("returns false by default when env var is undefined", () => {
    delete process.env.ENABLE_PUBLIC_REGISTRATION;
    expect(isPublicRegistrationEnabled()).toBe(false);
  });

  it("returns false when env var is empty string", () => {
    process.env.ENABLE_PUBLIC_REGISTRATION = "";
    expect(isPublicRegistrationEnabled()).toBe(false);
  });

  it("returns false when env var is malformed or not explicitly true", () => {
    process.env.ENABLE_PUBLIC_REGISTRATION = "1";
    expect(isPublicRegistrationEnabled()).toBe(false);

    process.env.ENABLE_PUBLIC_REGISTRATION = "yes";
    expect(isPublicRegistrationEnabled()).toBe(false);

    process.env.ENABLE_PUBLIC_REGISTRATION = "enabled";
    expect(isPublicRegistrationEnabled()).toBe(false);

    process.env.ENABLE_PUBLIC_REGISTRATION = "false";
    expect(isPublicRegistrationEnabled()).toBe(false);
  });

  it("returns true only when explicitly 'true' (case-insensitive and trimmed)", () => {
    process.env.ENABLE_PUBLIC_REGISTRATION = "true";
    expect(isPublicRegistrationEnabled()).toBe(true);

    process.env.ENABLE_PUBLIC_REGISTRATION = "TRUE";
    expect(isPublicRegistrationEnabled()).toBe(true);

    process.env.ENABLE_PUBLIC_REGISTRATION = "  true  ";
    expect(isPublicRegistrationEnabled()).toBe(true);
  });
});
