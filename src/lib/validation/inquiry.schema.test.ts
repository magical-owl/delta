import { describe, it, expect } from "vitest";
import { inquirySchema, formatZodError } from "./inquiry.schema";

describe("inquirySchema validation", () => {
  it("validates valid input payload successfully", () => {
    const validData = {
      email: "engineer@company.com",
      category: "architecture",
      subject: "Microservices transition plan",
      message: "We need architectural guidance for decoupling our services.",
      urgency: "high",
    };

    const result = inquirySchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("engineer@company.com");
      expect(result.data.category).toBe("architecture");
    }
  });

  it("applies defaults for optional category and urgency", () => {
    const dataWithDefaults = {
      email: "team@company.com",
      subject: "Default category test",
      message: "Testing default category assignment on schema parse.",
    };

    const result = inquirySchema.safeParse(dataWithDefaults);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("technical");
      expect(result.data.urgency).toBe("medium");
    }
  });

  it("fails when email is invalid", () => {
    const invalidData = {
      email: "not-an-email",
      subject: "Valid Subject Line",
      message: "This message has more than 10 characters.",
    };

    const result = inquirySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted.email).toMatch(/valid email/i);
    }
  });

  it("fails when subject is too short", () => {
    const invalidData = {
      email: "valid@test.com",
      subject: "Hi",
      message: "This message has more than 10 characters.",
    };

    const result = inquirySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted.subject).toMatch(/at least 5 characters/i);
    }
  });

  it("fails when message is too short", () => {
    const invalidData = {
      email: "valid@test.com",
      subject: "Legit Subject",
      message: "Too short",
    };

    const result = inquirySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = formatZodError(result.error);
      expect(formatted.message).toMatch(/at least 10 characters/i);
    }
  });
});
