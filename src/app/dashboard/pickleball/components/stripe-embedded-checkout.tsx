"use client";

import * as React from "react";
import {
  loadStripe,
  type StripeInstance,
  type StripeEmbeddedCheckout,
} from "@/lib/stripe/load-stripe";
import { AppIcon } from "@/components/ui/app-icon";

interface StripeEmbeddedCheckoutProps {
  clientSecret: string;
  publishableKey?: string;
  onComplete?: () => void;
  className?: string;
}

export function StripeEmbeddedCheckout({
  clientSecret,
  publishableKey,
  onComplete,
  className,
}: StripeEmbeddedCheckoutProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const activeKey =
    publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

  React.useEffect(() => {
    let checkoutInstance: StripeEmbeddedCheckout | null = null;
    let isCancelled = false;

    async function mountCheckout() {
      if (!activeKey) {
        setErrorMessage(
          "Stripe Publishable Key not detected. Ensure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is configured."
        );
        setIsLoading(false);
        return;
      }

      if (!clientSecret || !containerRef.current) return;

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const stripe: StripeInstance | null = await loadStripe(activeKey);
        if (!stripe) {
          throw new Error(
            "Unable to initialize Stripe client. Verify your publishable key."
          );
        }

        if (isCancelled) return;

        const initFn = stripe.initEmbeddedCheckout || stripe.createEmbeddedCheckoutPage;
        if (!initFn) {
          throw new Error("Embedded checkout is not supported by this Stripe client.");
        }

        checkoutInstance = await initFn.call(stripe, {
          clientSecret,
          onComplete: () => {
            if (onComplete) onComplete();
          },
        });

        if (isCancelled) {
          checkoutInstance.destroy();
          return;
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          checkoutInstance.mount(containerRef.current);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to initialize Stripe Embedded Checkout.";
          setErrorMessage(msg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    mountCheckout();

    return () => {
      isCancelled = true;
      if (checkoutInstance) {
        checkoutInstance.destroy();
      }
    };
  }, [activeKey, clientSecret, onComplete]);

  return (
    <div className={`relative min-h-[280px] w-full rounded-lg ${className || ""}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[var(--surface)]/90 backdrop-blur-xs rounded-lg border border-[var(--border)]">
          <AppIcon
            name="spinner"
            size="md"
            className="animate-spin text-[var(--primary)]"
          />
          <span className="text-xs font-medium text-[var(--text-muted)]">
            Loading secure Stripe payment form...
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <AppIcon name="triangle-exclamation" size="xs" />
            <span>Stripe Checkout Notice</span>
          </div>
          <p className="text-[11px] leading-relaxed">{errorMessage}</p>
        </div>
      )}

      <div
        ref={containerRef}
        id="stripe-checkout-container"
        className="w-full min-h-[280px] rounded-lg overflow-hidden"
      />
    </div>
  );
}
