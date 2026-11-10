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
  title: "Access Denied",
};

/**
 * Unauthorized page — shown when a user is authenticated but does not have
 * the required role or permission to access a resource (HTTP 403).
 */
export default function UnauthorizedPage() {
  return (
    <Card className="w-full border-[var(--border)] bg-[var(--surface)] shadow-md">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-center mb-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-error-bg)] text-[var(--color-error)]">
            <AppIcon name="shield-halved" size="lg" />
          </span>
        </div>
        <CardTitle className="text-center text-xl text-[var(--foreground)]">
          Access Denied
        </CardTitle>
        <CardDescription className="text-center text-[var(--text-muted)]">
          You don&apos;t have permission to view this page
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <AppAlert variant="error">
          Your account does not have the required permissions to access this resource. If
          you believe this is a mistake, please contact your administrator.
        </AppAlert>

        <Link href="/dashboard" className="block w-full">
          <AppButton variant="primary" size="lg" leftIcon="arrow-left" className="w-full">
            Back to Dashboard
          </AppButton>
        </Link>

        <a href="/auth/logout" className="block w-full">
          <AppButton variant="outline" size="lg" className="w-full">
            Sign Out
          </AppButton>
        </a>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[var(--border)] pt-4">
        <p className="text-xs text-[var(--text-muted)]">Error code: 403 Forbidden</p>
      </CardFooter>
    </Card>
  );
}
