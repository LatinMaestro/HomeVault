import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import { isAuthEmailConfigured } from "@/lib/auth-email";

export const metadata: Metadata = {
  title: "Choose new password",
  description: "Choose a new password using a valid HomeVault reset link.",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const recoveryAvailable = isAuthRuntimeConfigured() && isAuthEmailConfigured();
  const token = params.token?.trim();

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardDescription>Account recovery</CardDescription>
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription className="leading-6">
            A successful reset revokes existing sessions before you sign in again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {recoveryAvailable && token && !params.error ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="space-y-4">
              <p className="rounded-md border bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
                This password reset link is unavailable, invalid or expired.
              </p>
              <Button asChild className="w-full">
                <Link href="/forgot-password">Request a new link</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  );
}
