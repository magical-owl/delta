import { describe, expect, it, vi, beforeEach } from "vitest";
import { createCheckoutSessionAction } from "./create-checkout-session.action";

vi.mock("@/server/services/stripe.service", () => ({
  isStripeConfigured: vi.fn(),
  createPickleballCheckoutSession: vi.fn(),
  getStripePublishableKey: vi.fn(() => "pk_test_mock_123"),
}));

vi.mock("@/server/dal/repositories/pickleball-reservation.repository", () => ({
  createPickleballReservation: vi.fn().mockResolvedValue({ id: BigInt(1) }),
  findPickleballReservationByReference: vi.fn().mockResolvedValue(null),
}));

describe("createCheckoutSessionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates input and returns validation error for invalid date or missing court", async () => {
    const result = await createCheckoutSessionAction({
      courtId: "",
      courtName: "Court 1",
      date: "invalid-date",
      timeSlot: "9:00am-10:00am",
      durationMinutes: 60,
      startIso: "2026-11-16T09:00:00Z",
      endIso: "2026-11-16T10:00:00Z",
      timeZone: "UTC",
      playerName: "A",
      playerEmail: "invalid-email",
      playerPhone: "123",
      matchType: "Doubles Match",
      rentals: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.fieldErrors).toBeDefined();
    }
  });

  it("returns fallback test data when Stripe secret key is not configured", async () => {
    const { isStripeConfigured } = await import("@/server/services/stripe.service");
    vi.mocked(isStripeConfigured).mockReturnValue(false);

    const result = await createCheckoutSessionAction({
      courtId: "court_1",
      courtName: "Championship Court 1",
      date: "2026-11-16",
      timeSlot: "9:00am-10:00am",
      durationMinutes: 60,
      startIso: "2026-11-16T09:00:00Z",
      endIso: "2026-11-16T10:00:00Z",
      timeZone: "UTC",
      playerName: "Alex Rivera",
      playerEmail: "alex@delta.local",
      playerPhone: "+1 (555) 019-2834",
      matchType: "Doubles Match",
      rentals: ["Carbon Pro Paddle (Pair)"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isStripeLive).toBe(false);
      expect(result.data.amountTotal).toBe(35); // 25 standard + 10 paddle
      expect(result.data.bookingReference).toContain("PB-20261116-");
    }
  });

  it("calculates peak rate and rentals correctly when Stripe is enabled", async () => {
    const { isStripeConfigured, createPickleballCheckoutSession } =
      await import("@/server/services/stripe.service");
    vi.mocked(isStripeConfigured).mockReturnValue(true);
    vi.mocked(createPickleballCheckoutSession).mockResolvedValue({
      sessionId: "cs_test_123",
      clientSecret: "cs_test_123_secret_abc",
      amountTotal: 60, // 35 peak + 10 paddle + 15 ball machine
      currency: "usd",
    });

    const result = await createCheckoutSessionAction({
      courtId: "court_1",
      courtName: "Championship Court 1",
      date: "2026-11-16",
      timeSlot: "6:00pm-7:00pm", // peak hour
      durationMinutes: 60,
      startIso: "2026-11-16T18:00:00Z",
      endIso: "2026-11-16T19:00:00Z",
      timeZone: "UTC",
      playerName: "Alex Rivera",
      playerEmail: "alex@delta.local",
      playerPhone: "+1 (555) 019-2834",
      matchType: "Doubles Match",
      rentals: ["Carbon Pro Paddle (Pair)", "Lobster Ball Machine"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isStripeLive).toBe(true);
      expect(result.data.sessionId).toBe("cs_test_123");
      expect(result.data.clientSecret).toBe("cs_test_123_secret_abc");
      expect(result.data.amountTotal).toBe(60);
    }
  });
});
