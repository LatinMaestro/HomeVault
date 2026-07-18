import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Trash2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Account deletion",
  description: "How HomeVault users can delete their account and household data.",
};

export default function AccountDeletionInfoPage() {
  return (
    <AppShell activeSection="" publicAccess>
      <section className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">Account lifecycle</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Delete a HomeVault account</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Signed-in users can permanently delete their account from the Account screen.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-primary" aria-hidden="true" />
              In-app deletion
            </CardTitle>
            <CardDescription>
              Open Account, choose Delete account, review the consequences, enter the current password and type DELETE to confirm.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              HomeVault removes the login, sessions and household memberships. If the person is the household&apos;s only member, the household and its rooms, assets, maintenance, warranties, receipts, documents, reminders and private attachments enter the guarded deletion workflow.
            </p>
            <p>
              An owner cannot leave other members without an owner. Ownership must be transferred before deletion in that situation.
            </p>
            <Button asChild>
              <Link href="/account">Open Account</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              Backups and legal retention
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Active application records are removed through the account-deletion workflow. Infrastructure backups and provider logs may expire on provider schedules rather than instantly. Exact production periods and any legally required exceptions will be published in the final privacy policy.
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
