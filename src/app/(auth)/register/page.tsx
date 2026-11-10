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
import { AppIcon } from "@/components/ui/app-icon";
import { AppAlert } from "@/components/ui/app-alert";
import { isPublicRegistrationEnabled } from "@/lib/auth/registration-config";

export const metadata: Metadata = {
  title: "Account Registration",
};

/**
 * Registration page — Server Component.
 *
 * Public registration is disabled by default unless ENABLE_PUBLIC_REGISTRATION=true.
 * When disabled, renders a polished informational notice:
 * "Registration is currently by invitation only" with a working link to login.
 */
export default function RegisterPage() {
  const publicRegistrationOpen = isPublicRegistrationEnabled();

  if (!publicRegistrationOpen) {
    return (
      <Card className="w-full border-[var(--border)] bg-[var(--surface)] shadow-md">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-center mb-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
              <AppIcon name="lock" size="lg" />
            </span>
          </div>
          <CardTitle className="text-center text-xl text-[var(--foreground)]">
            Registration by Invitation Only
          </CardTitle>
          <CardDescription className="text-center text-[var(--text-muted)]">
            Public self-registration is currently disabled.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <AppAlert variant="info" title="Invitation Required">
            Accounts on this workspace are provisioned by an administrator. If you were
            invited, please use your invitation link or contact your workspace
            administrator for access.
          </AppAlert>

          <Link href="/login" className="block w-full">
            <AppButton
              variant="primary"
              size="lg"
              leftIcon="arrow-left"
              className="w-full"
            >
              Back to Sign In
            </AppButton>
          </Link>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-[var(--border)] pt-4">
          <p className="text-xs text-[var(--text-muted)] text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
            >
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full border-[var(--border)] bg-[var(--surface)] shadow-md">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-center mb-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
            <AppIcon name="users" size="lg" />
          </span>
        </div>
        <CardTitle className="text-center text-xl text-[var(--foreground)]">
          Create an account
        </CardTitle>
        <CardDescription className="text-center text-[var(--text-muted)]">
          Join the workspace — registration enabled
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Routes to Auth0 Universal Login with sign-up screen */}
        <a href="/auth/login?screen_hint=signup" className="block w-full">
          <AppButton variant="primary" size="lg" leftIcon="users" className="w-full">
            Create Account
          </AppButton>
        </a>

        <p className="text-center text-xs text-[var(--text-muted)] leading-relaxed">
          By creating an account you agree to our{" "}
          <span className="text-[var(--primary)]">Terms of Service</span> and{" "}
          <span className="text-[var(--primary)]">Privacy Policy</span>.
        </p>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[var(--border)] pt-4">
        <p className="text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
