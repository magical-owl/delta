import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

const mockConstructEvent = vi.fn();

vi.mock("@/server/services/stripe.service", () => ({
  getStripeServerClient: vi.fn(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}));

vi.mock("@/server/dal/repositories/pickleball-reservation.repository", () => ({
  findPickleballReservationByReference: vi.fn(),
  findPickleballReservationByStripeSession: vi.fn(),
  confirmPickleballReservationPayment: vi.fn(),
  createPickleballReservation: vi.fn(),
  updatePickleballReservationPayment: vi.fn(),
}));

vi.mock("@/app/dashboard/automations/actions/dispatch-webhook.action", () => ({
  dispatchWebhookAction: vi.fn().mockResolvedValue({ success: true, status: 200 }),
}));

describe("Stripe Webhook Route Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing stripe-signature header.");
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature token");
    });

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "invalid_sig",
      },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Webhook signature verification failed");
  });

  it("handles checkout.session.completed and confirms reservation payment", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_completed_123",
          payment_intent: "pi_test_intent_456",
          amount_total: 3500,
          customer_email: "player@example.com",
          metadata: {
            bookingReference: "PB-20261116-4321",
            courtId: "court_1",
            courtName: "Championship Court 1",
            date: "2026-11-16",
            timeSlot: "9:00am-10:00am",
            durationMinutes: "60",
            playerName: "Taylor Smith",
            playerPhone: "+1 (555) 234-5678",
            matchType: "Doubles Match",
            rentals: JSON.stringify(["Carbon Pro Paddle (Pair)"]),
          },
        },
      },
    });

    const { findPickleballReservationByReference, confirmPickleballReservationPayment } =
      await import("@/server/dal/repositories/pickleball-reservation.repository");
    const { dispatchWebhookAction } =
      await import("@/app/dashboard/automations/actions/dispatch-webhook.action");

    vi.mocked(findPickleballReservationByReference).mockResolvedValueOnce({
      id: BigInt(1),
      publicId: "uuid-1",
      bookingReference: "PB-20261116-4321",
      courtId: "court_1",
      courtName: "Championship Court 1",
      date: "2026-11-16",
      timeSlot: "9:00am-10:00am",
      durationMinutes: 60,
      startIso: "2026-11-16T09:00:00Z",
      endIso: "2026-11-16T10:00:00Z",
      timeZone: "UTC",
      playerName: "Taylor Smith",
      playerEmail: "player@example.com",
      playerPhone: "+1 (555) 234-5678",
      matchType: "Doubles Match",
      rentals: ["Carbon Pro Paddle (Pair)"],
      pinCode: "4321",
      totalAmount: 35,
      paymentStatus: "pending",
      paymentMethod: "Stripe",
      status: "confirmed",
      googleCalendarEventId: null,
      googleCalendarLink: null,
      cancellationReason: null,
      cancelledAt: null,
      stripeSessionId: "cs_test_completed_123",
      stripePaymentIntentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      headers: {
        "stripe-signature": "valid_test_signature",
      },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);

    expect(confirmPickleballReservationPayment).toHaveBeenCalledWith({
      bookingReference: "PB-20261116-4321",
      stripeSessionId: "cs_test_completed_123",
      stripePaymentIntentId: "pi_test_intent_456",
      paymentMethod: "Stripe",
      pinCode: "4321",
    });

    expect(dispatchWebhookAction).toHaveBeenCalled();
  });
});
