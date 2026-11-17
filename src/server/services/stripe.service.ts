import "server-only";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export interface StripeLineItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      description?: string;
    };
    unit_amount: number;
  };
  quantity: number;
}

export interface StripeCheckoutSession {
  id: string;
  client_secret?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  metadata?: Record<string, string>;
  payment_intent?: string | { id: string } | null;
  payment_status: string;
  status?: string | null;
}

export interface StripeCharge {
  id: string;
  payment_intent?: string | { id: string } | null;
  amount?: number;
  currency?: string;
  status?: string;
}

export interface StripeRefund {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_intent: string;
}

export interface StripeEvent<T = unknown> {
  id: string;
  type: string;
  data: {
    object: T;
  };
}

export interface StripeClient {
  checkout: {
    sessions: {
      create(params: {
        ui_mode?: string;
        mode?: string;
        line_items?: StripeLineItem[];
        customer_email?: string;
        metadata?: Record<string, string>;
        return_url?: string;
      }): Promise<StripeCheckoutSession>;
      retrieve(id: string, opts?: { expand?: string[] }): Promise<StripeCheckoutSession>;
    };
  };
  refunds: {
    create(params: {
      payment_intent: string;
      reason?: string;
      amount?: number;
    }): Promise<StripeRefund>;
  };
  webhooks: {
    constructEvent(
      rawBody: string,
      signature: string,
      secret: string,
      tolerance?: number
    ): StripeEvent;
  };
}

let cachedSecretKey: string | undefined = undefined;
let cachedPublishableKey: string | undefined = undefined;

/**
 * Lazily retrieves the Stripe Secret Key from process.env, falling back to .env.local
 * if the Next.js dev server was started before .env.local was created or saved.
 */
export function getStripeSecretKey(): string | undefined {
  if (cachedSecretKey) return cachedSecretKey;
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
    cachedSecretKey = process.env.STRIPE_SECRET_KEY;
    return cachedSecretKey;
  }

  try {
    const envLocalPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("STRIPE_SECRET_KEY=")) {
          const val = trimmed.slice("STRIPE_SECRET_KEY=".length).trim();
          if (val.startsWith("sk_")) {
            cachedSecretKey = val;
            return val;
          }
        }
      }
    }
  } catch {
    // Ignore read errors
  }

  return undefined;
}

/**
 * Lazily retrieves the Stripe Publishable Key from process.env, falling back to .env.local.
 */
export function getStripePublishableKey(): string | undefined {
  if (cachedPublishableKey) return cachedPublishableKey;
  if (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_")
  ) {
    cachedPublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    return cachedPublishableKey;
  }

  try {
    const envLocalPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=")) {
          const val = trimmed.slice("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=".length).trim();
          if (val.startsWith("pk_")) {
            cachedPublishableKey = val;
            return val;
          }
        }
      }
    }
  } catch {
    // Ignore read errors
  }

  return undefined;
}

/**
 * Encodes nested JavaScript objects into application/x-www-form-urlencoded format
 * matching Stripe REST API requirements.
 */
function toStripeUrlEncoded(obj: Record<string, unknown>, prefix = ""): URLSearchParams {
  const params = new URLSearchParams();

  function append(data: unknown, key: string) {
    if (data === undefined || data === null) return;
    if (typeof data === "object" && !Array.isArray(data)) {
      for (const [subKey, val] of Object.entries(data as Record<string, unknown>)) {
        append(val, key ? `${key}[${subKey}]` : subKey);
      }
    } else if (Array.isArray(data)) {
      data.forEach((val, idx) => {
        append(val, `${key}[${idx}]`);
      });
    } else {
      params.append(key, String(data));
    }
  }

  append(obj, prefix);
  return params;
}

/**
 * Internal authenticated fetch helper for Stripe REST API.
 */
async function stripeRequest<T>(
  endpoint: string,
  options: { method?: string; body?: URLSearchParams } = {}
): Promise<T> {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured in the server environment. Add it to .env.local to enable Stripe payments."
    );
  }

  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: options.method || (options.body ? "POST" : "GET"),
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: options.body ? options.body.toString() : undefined,
  });

  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    const errorObj = data?.error as { message?: string } | undefined;
    const errorMsg = errorObj?.message || `Stripe API error: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

/**
 * Validates Stripe webhook HMAC-SHA256 signature and returns the verified event.
 */
export function constructStripeWebhookEvent(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  tolerance = 300
): StripeEvent {
  if (!signatureHeader) {
    throw new Error("Missing stripe-signature header.");
  }

  const items = signatureHeader.split(",");
  let timestamp = -1;
  const signatures: string[] = [];

  for (const item of items) {
    const [k, v] = item.split("=");
    if (k === "t") timestamp = parseInt(v, 10);
    if (k === "v1") signatures.push(v);
  }

  if (timestamp === -1 || signatures.length === 0) {
    throw new Error("Invalid signature header format.");
  }

  const age = Math.floor(Date.now() / 1000) - timestamp;
  if (tolerance > 0 && Math.abs(age) > tolerance) {
    throw new Error("Webhook signature timestamp outside tolerance zone.");
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const expectedBuf = Buffer.from(expectedSignature);
  const isValid = signatures.some((sig) => {
    const sigBuf = Buffer.from(sig);
    return (
      sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)
    );
  });

  if (!isValid) {
    throw new Error("Webhook signature verification failed: signature mismatch.");
  }

  return JSON.parse(rawBody) as StripeEvent;
}

/**
 * Returns true if the server environment has configured the Stripe secret key.
 */
export function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey());
}

/**
 * Returns a singleton-like client providing checkout sessions, refunds, and webhook verification.
 */
export function getStripeServerClient(): StripeClient {
  return {
    checkout: {
      sessions: {
        async create(params) {
          const body = toStripeUrlEncoded(params as unknown as Record<string, unknown>);
          return stripeRequest<StripeCheckoutSession>("/checkout/sessions", {
            method: "POST",
            body,
          });
        },
        async retrieve(id, opts) {
          let endpoint = `/checkout/sessions/${id}`;
          if (opts?.expand && opts.expand.length > 0) {
            const query = opts.expand
              .map((e) => `expand[]=${encodeURIComponent(e)}`)
              .join("&");
            endpoint += `?${query}`;
          }
          return stripeRequest<StripeCheckoutSession>(endpoint);
        },
      },
    },
    refunds: {
      async create(params) {
        const body = toStripeUrlEncoded(params as unknown as Record<string, unknown>);
        return stripeRequest<StripeRefund>("/refunds", {
          method: "POST",
          body,
        });
      },
    },
    webhooks: {
      constructEvent: constructStripeWebhookEvent,
    },
  };
}

export interface PickleballCheckoutSessionParams {
  bookingReference: string;
  courtId: string;
  courtName: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  matchType: string;
  rentals: string[];
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  isPeakHour: boolean;
  returnUrl: string;
}

export interface PickleballCheckoutSessionResult {
  sessionId: string;
  clientSecret: string;
  amountTotal: number;
  currency: string;
}

/**
 * Creates an Embedded Stripe Checkout Session tailored for Delta Pickleball court reservation.
 */
export async function createPickleballCheckoutSession(
  params: PickleballCheckoutSessionParams
): Promise<PickleballCheckoutSessionResult> {
  const courtRateCents = params.isPeakHour ? 3500 : 2500;
  const lineItems: StripeLineItem[] = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: `${params.courtName} - Court Reservation`,
          description: `${params.date} • ${params.timeSlot} (${params.durationMinutes} min) - ${params.matchType}`,
        },
        unit_amount: courtRateCents,
      },
      quantity: 1,
    },
  ];

  if (params.rentals.includes("Carbon Pro Paddle (Pair)")) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Carbon Pro Paddle Rental (Pair)",
          description: "2x high-grade composite paddles with premium grip",
        },
        unit_amount: 1000,
      },
      quantity: 1,
    });
  }

  if (params.rentals.includes("Lobster Ball Machine")) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Lobster Ball Machine Rental",
          description: "High-capacity automated ball launcher with remote",
        },
        unit_amount: 1500,
      },
      quantity: 1,
    });
  }

  const client = getStripeServerClient();
  let session: StripeCheckoutSession;

  try {
    session = await client.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      line_items: lineItems,
      customer_email: params.playerEmail,
      metadata: {
        bookingReference: params.bookingReference,
        courtId: params.courtId,
        courtName: params.courtName,
        date: params.date,
        timeSlot: params.timeSlot,
        durationMinutes: String(params.durationMinutes),
        matchType: params.matchType,
        playerName: params.playerName,
        playerPhone: params.playerPhone,
        rentals: JSON.stringify(params.rentals),
      },
      return_url: params.returnUrl,
    });
  } catch (createErr: unknown) {
    const errorMsg = createErr instanceof Error ? createErr.message : String(createErr);
    if (errorMsg.includes("embedded_page") || errorMsg.includes("ui_mode value")) {
      // Fallback for legacy Stripe account versions
      session = await client.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "payment",
        line_items: lineItems,
        customer_email: params.playerEmail,
        metadata: {
          bookingReference: params.bookingReference,
          courtId: params.courtId,
          courtName: params.courtName,
          date: params.date,
          timeSlot: params.timeSlot,
          durationMinutes: String(params.durationMinutes),
          matchType: params.matchType,
          playerName: params.playerName,
          playerPhone: params.playerPhone,
          rentals: JSON.stringify(params.rentals),
        },
        return_url: params.returnUrl,
      });
    } else {
      throw createErr;
    }
  }

  try {
    session = await client.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      line_items: lineItems,
      customer_email: params.playerEmail,
      metadata: {
        bookingReference: params.bookingReference,
        courtId: params.courtId,
        courtName: params.courtName,
        date: params.date,
        timeSlot: params.timeSlot,
        durationMinutes: String(params.durationMinutes),
        matchType: params.matchType,
        playerName: params.playerName,
        playerPhone: params.playerPhone,
        rentals: JSON.stringify(params.rentals),
      },
      return_url: params.returnUrl,
    });
  } catch (createErr: unknown) {
    const errorMsg = createErr instanceof Error ? createErr.message : String(createErr);
    if (errorMsg.includes("embedded_page") || errorMsg.includes("ui_mode value")) {
      // Fallback for legacy Stripe account versions
      session = await client.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "payment",
        line_items: lineItems,
        customer_email: params.playerEmail,
        metadata: {
          bookingReference: params.bookingReference,
          courtId: params.courtId,
          courtName: params.courtName,
          date: params.date,
          timeSlot: params.timeSlot,
          durationMinutes: String(params.durationMinutes),
          matchType: params.matchType,
          playerName: params.playerName,
          playerPhone: params.playerPhone,
          rentals: JSON.stringify(params.rentals),
        },
        return_url: params.returnUrl,
      });
    } else {
      throw createErr;
    }
  }

  if (!session.client_secret) {
    throw new Error(
      "Stripe did not return a client_secret for the embedded checkout session."
    );
  }

  const fallbackTotalCents =
    courtRateCents +
    (params.rentals.includes("Carbon Pro Paddle (Pair)") ? 1000 : 0) +
    (params.rentals.includes("Lobster Ball Machine") ? 1500 : 0);

  const amountTotal = (session.amount_total ?? fallbackTotalCents) / 100;

  return {
    sessionId: session.id,
    clientSecret: session.client_secret,
    amountTotal,
    currency: session.currency || "usd",
  };
}

/**
 * Retrieves the status and details of an existing Checkout Session.
 */
export async function retrievePickleballCheckoutSession(
  sessionId: string
): Promise<StripeCheckoutSession> {
  const client = getStripeServerClient();
  return client.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "line_items"],
  });
}

/**
 * Refunds a payment intent when a court reservation is cancelled within policy.
 */
export async function refundPickleballPayment(params: {
  paymentIntentId: string;
  reason?: "requested_by_customer" | "duplicate" | "fraudulent";
  amountCents?: number;
}): Promise<StripeRefund> {
  const client = getStripeServerClient();
  return client.refunds.create({
    payment_intent: params.paymentIntentId,
    reason: params.reason || "requested_by_customer",
    amount: params.amountCents,
  });
}
