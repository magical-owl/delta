"use server";

import {
  isStripeConfigured,
  retrievePickleballCheckoutSession,
} from "@/server/services/stripe.service";
import { findPickleballReservationByReference } from "@/server/dal/repositories/pickleball-reservation.repository";

export type RetrieveCheckoutSessionResult =
  | {
      success: true;
      data: {
        status: string;
        paymentStatus: string;
        customerEmail: string | null;
        bookingReference: string | null;
        pinCode?: string;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

export async function retrieveCheckoutSessionAction(
  sessionId: string
): Promise<RetrieveCheckoutSessionResult> {
  if (!sessionId) {
    return {
      success: false,
      error: { code: "INVALID_SESSION_ID", message: "Session ID is required." },
    };
  }

  if (!isStripeConfigured()) {
    return {
      success: false,
      error: { code: "STRIPE_NOT_CONFIGURED", message: "Stripe is not configured." },
    };
  }

  try {
    const session = await retrievePickleballCheckoutSession(sessionId);
    const bookingReference = session.metadata?.bookingReference || null;

    let pinCode: string | undefined;
    if (bookingReference) {
      const dbRecord = await findPickleballReservationByReference(bookingReference);
      if (dbRecord) {
        pinCode = dbRecord.pinCode;
      }
    }

    return {
      success: true,
      data: {
        status: session.status || "open",
        paymentStatus: session.payment_status,
        customerEmail: session.customer_email || session.customer_details?.email || null,
        bookingReference,
        pinCode,
      },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to retrieve Stripe Checkout Session.";
    return {
      success: false,
      error: {
        code: "STRIPE_RETRIEVAL_ERROR",
        message,
      },
    };
  }
}
