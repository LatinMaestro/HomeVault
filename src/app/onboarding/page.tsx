import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { OnboardingForm } from "@/components/onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import {
  getCurrentHouseholdAccess,
  getCurrentVerifiedSessionUser,
} from "@/lib/household-access";

export const metadata: Metadata = {
  title: "Set up your home",
  description: "Create the first private household connected to a verified HomeVault account.",
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!isAuthRuntimeConfigured()) redirect("/sign-in");

  const user = await getCurrentVerifiedSessionUser();
  if (!user) redirect("/sign-in");

  if (await getCurrentHouseholdAccess()) redirect("/");

  const familyName = user.name.split(/\s+/)[0] || "My";
  const suggestedName = `${familyName} Family Home`;

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardDescription>First household</CardDescription>
          <CardTitle>Set up your home</CardTitle>
          <CardDescription className="leading-6">
            This creates a private household and makes you its owner. Address details are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm suggestedName={suggestedName} />
        </CardContent>
      </Card>
    </AuthShell>
  );
}
