"use server";

import {
  createPickleballCheckoutSessionSchema,
  formatZodError,
  type CreatePickleballCheckoutSessionInput,
} from "@/lib/validation/pickleball-reservation.schema";
import {
  isStripeConfigured,
  createPickleballCheckoutSession,
  getStripePublishableKey,
  type PickleballCheckoutSessionResult,
} from "@/server/services/stripe.service";
import {
  createPickleballReservation,
  findPickleballReservationByReference,
} from "@/server/dal/repositories/pickleball-reservation.repository";

export type CreateCheckoutSessionActionResult =
  | {
      success: true;
      data: {
        isStripeLive: boolean;
        bookingReference: string;
        clientSecret?: string;
        sessionId?: string;
        publishableKey?: string;
        amountTotal: number;
        currency: string;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string>;
      };
    };

/**
 * Determines whether a time slot falls in evening peak hours (5:00pm - 9:00pm).
 */
function isPeakTimeSlot(timeSlot: string): boolean {
  const normalized = timeSlot.toLowerCase().replace(/\s+/g, "");
  return (
    normalized.includes("5:00pm") ||
    normalized.includes("6:00pm") ||
    normalized.includes("7:00pm") ||
    normalized.includes("8:00pm") ||
    normalized.includes("17:00") ||
    normalized.includes("18:00") ||
    normalized.includes("19:00") ||
    normalized.includes("20:00")
  );
}

export async function createCheckoutSessionAction(
  rawInput: CreatePickleballCheckoutSessionInput
): Promise<CreateCheckoutSessionActionResult> {
  const validation = createPickleballCheckoutSessionSchema.safeParse(rawInput);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid reservation checkout parameters.",
        fieldErrors: formatZodError(validation.error),
      },
    };
  }

  const input = validation.data;
  const isPeak = isPeakTimeSlot(input.timeSlot);
  const baseCourtFee = isPeak ? 35 : 25;
  const rentalsFee =
    (input.rentals.includes("Carbon Pro Paddle (Pair)") ? 10 : 0) +
    (input.rentals.includes("Lobster Ball Machine") ? 15 : 0);
  const totalAmount = baseCourtFee + rentalsFee;

  const pinCode = String(Math.floor(1000 + Math.random() * 9000));
  const bookingReference = `PB-${input.date.replace(/-/g, "")}-${pinCode}`;

  const defaultReturnUrl = `${
    process.env.APP_BASE_URL || "http://localhost:3000"
  }/dashboard/pickleball?session_id={CHECKOUT_SESSION_ID}&booking_ref=${bookingReference}`;
  const returnUrl = input.returnUrl || defaultReturnUrl;

  // Check if Stripe is configured with an active secret key
  const stripeEnabled = isStripeConfigured();

  if (stripeEnabled) {
    try {
      const sessionResult: PickleballCheckoutSessionResult =
        await createPickleballCheckoutSession({
          bookingReference,
          courtId: input.courtId,
          courtName: input.courtName,
          date: input.date,
          timeSlot: input.timeSlot,
          durationMinutes: input.durationMinutes,
          matchType: input.matchType,
          rentals: input.rentals,
          playerName: input.playerName,
          playerEmail: input.playerEmail,
          playerPhone: input.playerPhone,
          isPeakHour: isPeak,
          returnUrl,
        });

      // Optionally pre-insert or stage the reservation in PostgreSQL with 'pending' status
      try {
        const existing = await findPickleballReservationByReference(bookingReference);
        if (!existing) {
          await createPickleballReservation({
            bookingReference,
            courtId: input.courtId,
            courtName: input.courtName,
            date: input.date,
            timeSlot: input.timeSlot,
            durationMinutes: input.durationMinutes,
            startIso: input.startIso,
            endIso: input.endIso,
            timeZone: input.timeZone,
            playerName: input.playerName,
            playerEmail: input.playerEmail,
            playerPhone: input.playerPhone,
            matchType: input.matchType,
            rentals: input.rentals,
            pinCode,
            totalAmount: sessionResult.amountTotal,
            paymentStatus: "pending",
            paymentMethod: "Stripe",
            stripeSessionId: sessionResult.sessionId,
            status: "confirmed",
          });
        }
      } catch (dbErr) {
        console.warn(
          "[StripeCheckout] Pre-booking DB persistence skipped/deferred:",
          dbErr
        );
      }

      return {
        success: true,
        data: {
          isStripeLive: true,
          bookingReference,
          clientSecret: sessionResult.clientSecret,
          sessionId: sessionResult.sessionId,
          publishableKey: getStripePublishableKey(),
          amountTotal: sessionResult.amountTotal,
          currency: sessionResult.currency,
        },
      };
    } catch (stripeErr: unknown) {
      const message =
        stripeErr instanceof Error
          ? stripeErr.message
          : "Unable to initialize Stripe Checkout Session. Please try again.";
      console.error("[StripeCheckout] Error creating Stripe session:", stripeErr);
      return {
        success: false,
        error: {
          code: "STRIPE_SESSION_ERROR",
          message,
        },
      };
    }
  }

  // Fallback for local development or preview environments where Stripe API keys are not yet configured
  return {
    success: true,
    data: {
      isStripeLive: false,
      bookingReference,
      amountTotal: totalAmount,
      currency: "usd",
    },
  };
}
