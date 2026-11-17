/**
 * Safe browser Stripe.js loader.
 * Loads Stripe.js securely from https://js.stripe.com/v3/ directly in the browser,
 * ensuring PCI DSS compliance without relying on bundler module resolution for client scripts.
 */

export interface StripeEmbeddedCheckout {
  mount(element: HTMLElement | string): void;
  unmount(): void;
  destroy(): void;
}

export interface StripeEmbeddedCheckoutOptions {
  clientSecret: string;
  onComplete?: () => void;
}

export interface StripeInstance {
  initEmbeddedCheckout?: (
    options: StripeEmbeddedCheckoutOptions
  ) => Promise<StripeEmbeddedCheckout>;
  createEmbeddedCheckoutPage?: (
    options: StripeEmbeddedCheckoutOptions
  ) => Promise<StripeEmbeddedCheckout>;
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

let stripeScriptPromise: Promise<((key: string) => StripeInstance) | null> | null = null;

export function loadStripe(publishableKey: string): Promise<StripeInstance | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (window.Stripe) {
    return Promise.resolve(window.Stripe(publishableKey));
  }

  if (!stripeScriptPromise) {
    stripeScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src^="https://js.stripe.com"]'
      );

      if (existingScript) {
        if (window.Stripe) {
          resolve(window.Stripe);
          return;
        }
        existingScript.addEventListener("load", () => {
          if (window.Stripe) resolve(window.Stripe);
          else reject(new Error("Stripe.js loaded but window.Stripe is unavailable."));
        });
        existingScript.addEventListener("error", (e) => reject(e));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = () => {
        if (window.Stripe) {
          resolve(window.Stripe);
        } else {
          reject(new Error("Stripe.js loaded but window.Stripe is unavailable."));
        }
      };
      script.onerror = () => {
        reject(
          new Error("Failed to load Stripe.js script from https://js.stripe.com/v3/")
        );
      };

      document.head.appendChild(script);
    });
  }

  return stripeScriptPromise.then((stripeConstructor) => {
    if (!stripeConstructor) return null;
    return stripeConstructor(publishableKey);
  });
}
