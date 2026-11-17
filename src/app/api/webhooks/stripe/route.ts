import { NextRequest, NextResponse } from "next/server";
import {
  getStripeServerClient,
  type StripeEvent,
  type StripeCheckoutSession,
  type StripeCharge,
} from "@/server/services/stripe.service";
import {
  findPickleballReservationByReference,
  confirmPickleballReservationPayment,
  createPickleballReservation,
} from "@/server/dal/repositories/pickleball-reservation.repository";
import { dispatchWebhookAction } from "@/app/dashboard/automations/actions/dispatch-webhook.action";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[StripeWebhook] STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook secret is not configured on the server." },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let event: StripeEvent;

  try {
    const rawBody = await req.text();
    const stripe = getStripeServerClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[StripeWebhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as StripeCheckoutSession;
        const metadata = session.metadata || {};
        const bookingReference = metadata.bookingReference;
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        if (bookingReference) {
          // 1. Confirm and mark reservation as paid in DB
          let record = await findPickleballReservationByReference(bookingReference);
          const pinCode =
            record?.pinCode || String(Math.floor(1000 + Math.random() * 9000));

          if (record) {
            await confirmPickleballReservationPayment({
              bookingReference,
              stripeSessionId: session.id,
              stripePaymentIntentId: paymentIntentId,
              paymentMethod: "Stripe",
              pinCode,
            });
          } else {
            // If pre-insert was deferred or unavailable, create record now
            try {
              const rentalsList: string[] = metadata.rentals
                ? JSON.parse(metadata.rentals)
                : [];

              record = await createPickleballReservation({
                bookingReference,
                courtId: metadata.courtId || "court-1",
                courtName: metadata.courtName || "Grandstand Court",
                date: metadata.date || new Date().toISOString().slice(0, 10),
                timeSlot: metadata.timeSlot || "9:00am-10:00am",
                durationMinutes: Number(metadata.durationMinutes) || 60,
                startIso: new Date().toISOString(),
                endIso: new Date(Date.now() + 3600000).toISOString(),
                timeZone: "UTC",
                playerName: metadata.playerName || "Valued Player",
                playerEmail:
                  session.customer_email || metadata.playerEmail || "player@example.com",
                playerPhone: metadata.playerPhone || "N/A",
                matchType: metadata.matchType || "Doubles Match",
                rentals: rentalsList,
                pinCode,
                totalAmount: (session.amount_total ?? 2500) / 100,
                paymentStatus: "paid",
                paymentMethod: "Stripe",
                stripeSessionId: session.id,
                stripePaymentIntentId: paymentIntentId,
                status: "confirmed",
              });
            } catch (createErr) {
              console.warn(
                "[StripeWebhook] Notice during reservation creation:",
                createErr
              );
            }
          }

          // 2. Dispatch to n8n webhook for Google Calendar sync & member notification
          const n8nWebhookUrl =
            process.env.N8N_PICKLEBALL_WEBHOOK_URL ||
            "https://ozephyrmor.app.n8n.cloud/webhook/delta-pickleball-reservation";

          try {
            await dispatchWebhookAction(n8nWebhookUrl, {
              action: "book_court",
              bookingReference,
              courtId: metadata.courtId,
              courtName: metadata.courtName,
              date: metadata.date,
              timeSlot: metadata.timeSlot,
              durationMinutes: Number(metadata.durationMinutes) || 60,
              playerName: metadata.playerName,
              playerEmail: session.customer_email || metadata.playerEmail,
              playerPhone: metadata.playerPhone,
              matchType: metadata.matchType,
              rentals: metadata.rentals ? JSON.parse(metadata.rentals) : [],
              totalAmount: (session.amount_total ?? 2500) / 100,
              paymentMethod: "Stripe",
              paymentStatus: "paid",
              stripeSessionId: session.id,
              stripePaymentIntentId: paymentIntentId,
              pinCode,
            });
          } catch (dispatchErr) {
            console.error("[StripeWebhook] n8n sync dispatch error:", dispatchErr);
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as StripeCharge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (paymentIntentId) {
          console.log(
            `[StripeWebhook] Charge refunded for payment intent: ${paymentIntentId}`
          );
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (handlerErr: unknown) {
    console.error("[StripeWebhook] Handler processing error:", handlerErr);
    return NextResponse.json(
      { error: "Internal webhook handler processing error" },
      { status: 500 }
    );
  }
}
