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

export const metadata: Metadata = {
  title: "Forgot Password",
};

/**
 * Forgot password page — Server Component.
 *
 * Password reset is handled entirely by Auth0.  This page explains the flow
 * and directs the user to Auth0 Universal Login where they can request a
 * reset email.
 */
export default function ForgotPasswordPage() {
  return (
    <Card className="w-full border-[var(--border)] bg-[var(--surface)] shadow-md">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-center mb-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warning-bg)] text-[var(--color-warning)]">
            <AppIcon name="lock" size="lg" />
          </span>
        </div>
        <CardTitle className="text-center text-xl text-[var(--foreground)]">
          Reset your password
        </CardTitle>
        <CardDescription className="text-center text-[var(--text-muted)]">
          We&apos;ll send you a secure reset link
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <AppAlert variant="info" hideIcon={false}>
          Password reset is handled securely by Auth0. Click the button below to open the
          password reset flow — you&apos;ll receive an email with a one-time reset link.
        </AppAlert>

        {/* Initiates a login flow; the user can click "Forgot password?" in Auth0 UI */}
        <a href="/auth/login" className="block w-full">
          <AppButton
            variant="primary"
            size="lg"
            leftIcon="arrows-rotate"
            className="w-full"
          >
            Reset Password
          </AppButton>
        </a>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[var(--border)] pt-4">
        <p className="text-sm text-[var(--text-muted)]">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
          >
            Back to sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
