import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2 py-1", "bg-blue-500")).toBe("px-2 py-1 bg-blue-500");
  });

  it("handles conditional classes", () => {
    const isPrimary = true;
    const isHidden = false;
    expect(cn("base-class", isPrimary && "text-white", isHidden && "hidden")).toBe(
      "base-class text-white"
    );
  });

  it("resolves conflicting Tailwind utilities via tailwind-merge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles null, undefined, and empty strings gracefully", () => {
    expect(cn("btn", null, undefined, "")).toBe("btn");
  });
});
