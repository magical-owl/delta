"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { AppInput } from "@/components/ui/app-input";
import { AppFormField } from "@/components/ui/app-form-field";
import { AppAlert } from "@/components/ui/app-alert";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Invalid email or password.");
        }

        router.push("/dashboard");
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    });
  };

  return (
    <Card className="w-full border-[var(--border)] bg-[var(--surface)] shadow-md">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-center mb-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
            <AppIcon name="user-shield" size="lg" />
          </span>
        </div>
        <CardTitle className="text-center text-xl text-[var(--foreground)]">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center text-[var(--text-muted)]">
          Sign in to access your administrative workspace
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <AppAlert variant="error" title="Sign In Error">
            {error}
          </AppAlert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <AppFormField label="Email address" required>
            <AppInput
              type="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </AppFormField>

          <AppFormField label="Password" required>
            <AppInput
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </AppFormField>

          <AppButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign In with Credentials"}
          </AppButton>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--surface)] px-2 text-[var(--text-muted)]">
              or federated login
            </span>
          </div>
        </div>

        {/* Auth0 SSO Option */}
        <a href="/auth/login" className="block w-full">
          <AppButton variant="outline" size="md" className="w-full">
            Sign In with Auth0 SSO
          </AppButton>
        </a>

        {/* Forgot password link */}
        <div className="text-center pt-1">
          <Link
            href="/forgot-password"
            className="text-xs text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
          >
            Forgot your password?
          </Link>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[var(--border)] pt-4">
        <p className="text-xs text-[var(--text-muted)]">
          Registration is by invitation only.{" "}
          <Link
            href="/register"
            className="font-medium text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded"
          >
            Learn more
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
