import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DeleteAccountForm } from "@/components/delete-account-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Delete account",
  description: "Permanently delete a HomeVault account and eligible household records.",
};

export const dynamic = "force-dynamic";

export default function DeleteAccountPage() {
  return (
    <AppShell activeSection="Account">
      <section className="mx-auto max-w-2xl space-y-5">
        <div>
          <p className="text-sm font-medium text-destructive">Permanent action</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Delete your account</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Export anything you need first. This action cannot be undone.
          </p>
        </div>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
              What will be deleted
            </CardTitle>
            <CardDescription className="leading-6">
              Your login, sessions and memberships are removed. A household and all of its records are also deleted when you are its only member.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">
              HomeVault blocks deletion when you own a household with other members, because ownership must be transferred first.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <a href="/api/export/household.json" download>Export household first</a>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/account">Cancel</Link>
              </Button>
            </div>
            <DeleteAccountForm />
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
