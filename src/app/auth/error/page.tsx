import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AppButton } from "@/components/ui/app-button";
import { AppAlert } from "@/components/ui/app-alert";
import { AppIcon } from "@/components/ui/app-icon";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Authentication Error — ${siteConfig.name}`,
};

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string; error_description?: string }>;
}

/**
 * Auth error page — shown when Auth0 redirects back with an error parameter.
 *
 * Lives at /auth/error.  Inherits the root layout (no sidebar dashboard chrome).
 */
export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const errorCode = params.error ?? "unknown_error";
  const errorDescription =
    params.error_description ?? "An unexpected authentication error occurred.";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Site wordmark */}
        <div className="mb-8 flex flex-col items-center gap-1 text-center">
          <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {siteConfig.name}
          </span>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
            {siteConfig.tagline}
          </span>
        </div>

        <Card className="w-full border-[var(--border)] bg-[var(--surface)] shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-center mb-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-error-bg)] text-[var(--color-error)]">
                <AppIcon name="circle-exclamation" size="lg" />
              </span>
            </div>
            <CardTitle className="text-center text-xl text-[var(--foreground)]">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-center text-[var(--text-muted)]">
              Something went wrong during sign-in
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <AppAlert variant="error" title="Sign-in failed">
              {errorDescription}
            </AppAlert>

            {errorCode !== "unknown_error" && (
              <p className="text-center text-xs text-[var(--text-muted)] font-mono">
                Error: {errorCode}
              </p>
            )}

            <a href="/auth/login" className="block w-full">
              <AppButton
                variant="primary"
                size="lg"
                leftIcon="arrows-rotate"
                className="w-full"
              >
                Try Again
              </AppButton>
            </a>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-[var(--border)] pt-4">
            <Link
              href="/"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded transition-colors"
            >
              <AppIcon name="arrow-left" size="xs" className="mr-1" />
              Go to home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
