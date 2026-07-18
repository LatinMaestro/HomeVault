import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import { isAuthEmailConfigured } from "@/lib/auth-email";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Request a secure HomeVault password reset link.",
};

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const recoveryAvailable = isAuthRuntimeConfigured() && isAuthEmailConfigured();

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardDescription>Account recovery</CardDescription>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription className="leading-6">
            Enter your account email. HomeVault does not reveal whether an address is registered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {recoveryAvailable ? (
            <ForgotPasswordForm />
          ) : (
            <p className="rounded-md border bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
              Password recovery is not enabled in this deployment because secure email delivery is unavailable.
            </p>
          )}
          <Button asChild className="w-full" variant="outline">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
