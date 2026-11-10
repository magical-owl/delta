import { describe, it, expect } from "vitest";
import { Permission, type PermissionKey } from "./permissions";
import { SystemRole } from "./roles";

describe("Permission", () => {
  it("all permission values are non-empty strings", () => {
    const values = Object.values(Permission);
    expect(values.length).toBeGreaterThan(0);
    values.forEach((v) => {
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(0);
    });
  });

  it("all permission values are unique", () => {
    const values = Object.values(Permission) as PermissionKey[];
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it("permission keys follow the namespace:action format", () => {
    Object.values(Permission).forEach((v) => {
      expect(v).toMatch(/^[a-z_]+:[a-z_]+$/);
    });
  });
});

describe("SystemRole", () => {
  it("all role values are unique strings", () => {
    const values = Object.values(SystemRole);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
    values.forEach((v) => {
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(0);
    });
  });
});
