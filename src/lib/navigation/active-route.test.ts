import { describe, it, expect } from "vitest";
import { isActiveRoute } from "./active-route";

describe("isActiveRoute utility", () => {
  it("matches exact routes when exactMatch is true", () => {
    expect(isActiveRoute("/dashboard", "/dashboard", true)).toBe(true);
    expect(isActiveRoute("/dashboard/users", "/dashboard", true)).toBe(false);
  });

  it("matches nested routes when exactMatch is false", () => {
    expect(
      isActiveRoute("/dashboard/management/teams", "/dashboard/management/teams")
    ).toBe(true);
    expect(
      isActiveRoute("/dashboard/management/teams/create", "/dashboard/management/teams")
    ).toBe(true);
  });

  it("prevents false-positive substring matches", () => {
    // /dashboard/user must NOT match /dashboard/users
    expect(isActiveRoute("/dashboard/users", "/dashboard/user")).toBe(false);
    expect(isActiveRoute("/dashboard/roles-and-permissions", "/dashboard/roles")).toBe(
      false
    );
  });

  it("handles trailing slashes consistently", () => {
    expect(isActiveRoute("/dashboard/projects/", "/dashboard/projects")).toBe(true);
    expect(isActiveRoute("/dashboard/projects", "/dashboard/projects/")).toBe(true);
  });

  it("returns false on empty or invalid inputs", () => {
    expect(isActiveRoute("", "/dashboard")).toBe(false);
    expect(isActiveRoute("/dashboard", "")).toBe(false);
  });
});
