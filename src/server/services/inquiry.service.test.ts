import { describe, it, expect, beforeEach } from "vitest";
import { InquiryService } from "./inquiry.service";
import { InquiryInput } from "@/lib/validation/inquiry.schema";

describe("InquiryService", () => {
  let service: InquiryService;

  beforeEach(() => {
    service = new InquiryService();
  });

  it("calculates priority scores deterministically", () => {
    const securityHigh: InquiryInput = {
      email: "ciso@company.com",
      category: "security",
      subject: "Vulnerability Notification",
      message: "Security report regarding header configuration.",
      urgency: "high",
    };

    const generalLow: InquiryInput = {
      email: "user@company.com",
      category: "general",
      subject: "General Question",
      message: "Inquiring about office hours and contact details.",
      urgency: "low",
    };

    expect(service.calculatePriorityScore(securityHigh)).toBe(100); // 10 base + 40 security + 50 high
    expect(service.calculatePriorityScore(generalLow)).toBe(10); // 10 base + 0 general + 0 low
  });

  it("creates and records an inquiry with generated ID and timestamp", async () => {
    const input: InquiryInput = {
      email: "lead@delta.local",
      category: "architecture",
      subject: "Orchestration Pipeline",
      message: "Testing domain service creation flow.",
      urgency: "medium",
    };

    const created = await service.createInquiry(input);
    expect(created.id).toMatch(/^inq_/);
    expect(created.status).toBe("received");
    expect(created.createdAt).toBeDefined();

    const summary = await service.getSummary();
    expect(summary.totalInquiries).toBeGreaterThanOrEqual(1);
    expect(summary.categories.architecture).toBeGreaterThanOrEqual(1);
  });
});
