"use server";

import {
  cancelPickleballReservationSchema,
  formatZodError,
  type CancelPickleballReservationInput,
} from "@/lib/validation/pickleball-reservation.schema";
import {
  cancelPickleballReservation,
  findPickleballReservationByReference,
  findPickleballReservationByPublicId,
} from "@/server/dal/repositories/pickleball-reservation.repository";
import {
  isStripeConfigured,
  refundPickleballPayment,
} from "@/server/services/stripe.service";
import {
  dispatchWebhookAction,
  type DispatchWebhookResult,
} from "../../automations/actions/dispatch-webhook.action";

export type CancelReservationActionResult =
  | {
      success: true;
      data: {
        bookingReference: string;
        refunded: boolean;
        stripeRefundId?: string;
        cancelledAt: string;
        dispatchResult?: DispatchWebhookResult;
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

export async function cancelPickleballReservationAction(
  rawInput: CancelPickleballReservationInput
): Promise<CancelReservationActionResult> {
  const validation = cancelPickleballReservationSchema.safeParse(rawInput);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid cancellation request parameters.",
        fieldErrors: formatZodError(validation.error),
      },
    };
  }

  const input = validation.data;
  const nowIso = new Date().toISOString();
  let stripeRefundId: string | undefined;

  // 1. Check if reservation exists in DB to retrieve stripePaymentIntentId
  let reservationRecord = null;
  try {
    if (input.publicId) {
      reservationRecord = await findPickleballReservationByPublicId(input.publicId);
    }
    if (!reservationRecord && input.bookingReference) {
      reservationRecord = await findPickleballReservationByReference(
        input.bookingReference
      );
    }
  } catch (findErr) {
    console.warn(
      "[PickleballReservation] Could not query reservation record for refund:",
      findErr
    );
  }

  // 2. Trigger Stripe Refund if payment intent is present
  if (
    reservationRecord?.stripePaymentIntentId &&
    reservationRecord.paymentStatus === "paid" &&
    isStripeConfigured()
  ) {
    try {
      const refund = await refundPickleballPayment({
        paymentIntentId: reservationRecord.stripePaymentIntentId,
        reason: "requested_by_customer",
      });
      stripeRefundId = refund.id;
    } catch (refundErr) {
      console.error(
        "[PickleballReservation] Stripe refund processing notice:",
        refundErr
      );
    }
  }

  // 3. Update database record if publicId provided
  if (input.publicId) {
    try {
      await cancelPickleballReservation(
        input.publicId,
        input.reason || "Player cancelled court reservation"
      );
    } catch (err) {
      console.warn("[PickleballReservation] DB cancellation skipped:", err);
    }
  }

  // 2. Dispatch cancellation event to n8n webhook (deletes/updates Google Calendar event & revokes PIN)
  const targetWebhook =
    input.webhookUrl ||
    "https://ozephyrmor.app.n8n.cloud/webhook/delta-pickleball-reservation";

  let dispatchResult: DispatchWebhookResult | undefined;

  try {
    const payload = {
      action: "cancel_court",
      bookingReference: input.bookingReference,
      publicId: input.publicId,
      date: input.date,
      courtId: input.courtId,
      timeSlot: input.timeSlot,
      googleCalendarEventId: input.googleCalendarEventId,
      reason: input.reason || "Player requested cancellation",
    };

    dispatchResult = await dispatchWebhookAction(targetWebhook, payload);
  } catch (whErr) {
    console.error("[PickleballReservation] n8n cancellation dispatch error:", whErr);
  }

  return {
    success: true,
    data: {
      bookingReference: input.bookingReference,
      refunded: true,
      stripeRefundId,
      cancelledAt: nowIso,
      dispatchResult,
    },
  };
}
