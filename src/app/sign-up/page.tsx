import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/components/sign-up-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthSignupEnabled } from "@/lib/auth-config";
import { getCurrentVerifiedSessionUser } from "@/lib/household-access";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a verified HomeVault household account when signup is available.",
};

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  if (await getCurrentVerifiedSessionUser()) redirect("/account");

  const signupEnabled = isAuthSignupEnabled();

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardDescription>Private household access</CardDescription>
          <CardTitle>Create your account</CardTitle>
          <CardDescription className="leading-6">
            HomeVault verifies each email before allowing household access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {signupEnabled ? (
            <SignUpForm />
          ) : (
            <div className="space-y-4">
              <p className="rounded-md border bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
                New account creation is currently closed. Signup opens only when secure email verification is available.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/sign-in">Go to sign in</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  );
}
