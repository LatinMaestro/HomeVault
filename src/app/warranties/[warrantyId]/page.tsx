import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDateStatus } from "@/lib/date-status";
import { getDisplayLabel } from "@/lib/display-labels";
import { getWarranty } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Warranty Detail",
  description: "Review a HomeVault warranty record.",
};

export const dynamic = "force-dynamic";

export default async function WarrantyPage({
  params,
}: {
  params: Promise<{ warrantyId: string }>;
}) {
  const { warrantyId } = await params;
  const warranty = await getWarranty(warrantyId);

  if (!warranty.data) {
    return (
      <AppShell activeSection="Warranties">
        <section className="space-y-5">
          <PageHeader
            eyebrow="Warranties"
            title="Warranty not found"
            description="This warranty was not found in the current HomeVault data source."
          />
          <DataSourceNote source={warranty.source} />
          <EmptyState
            title="No matching warranty"
            description="The warranty may have been removed, may not exist in the configured database, or may not be part of the built-in sample data."
            action={<BackLinkButton href="/warranties">Back to warranties</BackLinkButton>}
          />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Warranties">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Warranties"
          title={warranty.data.assetName}
          description="Review coverage, linked document metadata and recorded follow-ups for this asset."
          action={<BackLinkButton href="/warranties">Back to warranties</BackLinkButton>}
        />
        <DataSourceNote source={warranty.source} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="secondary">
            <Link href={`/warranties/${warranty.data.id}/edit`}>Edit warranty</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/vault/assets/${warranty.data.assetId}`}>View covered asset</Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Warranty information</CardTitle>
            <DateStatusBadge
              status={getDateStatus(warranty.data.expiresAtInput, "warranty")}
            />
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Provider", value: warranty.data.provider },
                { label: "Policy number", value: warranty.data.policyNumber },
                { label: "Starts", value: warranty.data.startsAt },
                { label: "Expires", value: warranty.data.expiresAt },
                { label: "Notes", value: warranty.data.notes },
              ]}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Related documents</CardTitle>
              <CardDescription>Document metadata linked to this warranty.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {warranty.data.documents.length > 0 ? (
                warranty.data.documents.map((document) => (
                  <Link
                    key={document.id}
                    href={`/receipts/${document.id}`}
                    className="block min-h-11 rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <p className="font-medium text-foreground">{document.title}</p>
                    <p className="text-muted-foreground">{getDisplayLabel(document.type)}</p>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No document metadata is linked to this warranty yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up reminders</CardTitle>
              <CardDescription>Recorded dates linked to this warranty.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {warranty.data.reminders.length > 0 ? (
                warranty.data.reminders.map((reminder) => (
                  <Link
                    key={reminder.id}
                    href={`/maintenance/reminders/${reminder.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <span>
                      <span className="block font-medium text-foreground">{reminder.title}</span>
                      <span className="block text-muted-foreground">Due {reminder.dueAt}</span>
                    </span>
                    <Badge variant="secondary">{getDisplayLabel(reminder.status)}</Badge>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No reminders are linked to this warranty yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
