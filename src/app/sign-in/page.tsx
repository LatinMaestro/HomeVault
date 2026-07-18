import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { SignInForm } from "@/components/sign-in-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthRuntimeConfigured, isAuthSignupEnabled } from "@/lib/auth-config";
import { getCurrentVerifiedSessionUser } from "@/lib/household-access";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to a verified HomeVault household account.",
};

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const runtimeConfigured = isAuthRuntimeConfigured();
  const signupEnabled = isAuthSignupEnabled();

  if (runtimeConfigured && (await getCurrentVerifiedSessionUser())) {
    redirect("/account");
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardDescription>Private household access</CardDescription>
          <CardTitle>Sign in to HomeVault</CardTitle>
          <CardDescription className="leading-6">
            Use the verified email and password connected to your household.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {runtimeConfigured ? (
            <SignInForm />
          ) : (
            <p className="rounded-md border bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
              Accounts are not enabled in this deployment. The sample HomeVault experience remains available without personal data.
            </p>
          )}
          {signupEnabled ? (
            <p className="text-center text-sm text-muted-foreground">
              New to HomeVault?{" "}
              <Link className="font-medium text-primary hover:underline" href="/sign-up">
                Create an account
              </Link>
            </p>
          ) : null}
          {!runtimeConfigured ? (
            <Button asChild className="w-full" variant="outline">
              <Link href="/">Review the sample home</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </AuthShell>
  );
}
