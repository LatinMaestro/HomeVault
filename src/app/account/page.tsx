import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, UserRound } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import {
  getCurrentHouseholdAccess,
  getCurrentVerifiedSessionUser,
} from "@/lib/household-access";

export const metadata: Metadata = {
  title: "Account",
  description: "Review the verified account and household access connected to HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  if (!isAuthRuntimeConfigured()) redirect("/sign-in");

  const user = await getCurrentVerifiedSessionUser();
  if (!user) redirect("/sign-in");

  const access = await getCurrentHouseholdAccess();

  return (
    <AppShell activeSection="Account">
      <section className="mx-auto max-w-2xl space-y-5">
        <div>
          <Badge variant="secondary">Account</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">Your HomeVault access</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review the verified identity and household role used by server-side access checks.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <CardDescription>Verified identity</CardDescription>
                <CardTitle>{user.name}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="break-all text-sm text-muted-foreground">{user.email}</p>
            <SignOutButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <CardDescription>Household membership</CardDescription>
                <CardTitle>{access ? "Access confirmed" : "Setup required"}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {access ? (
              <div className="flex items-center justify-between gap-3 rounded-md border bg-background p-3">
                <span className="text-sm text-muted-foreground">Current role</span>
                <Badge variant="secondary">{access.role}</Badge>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  This verified account is not connected to a household yet. Create the first home to begin using private records.
                </p>
                <Button asChild>
                  <Link href="/onboarding">Set up my home</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
