import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWarranties } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Warranties",
  description: "Review warranty records linked to household assets in HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function WarrantiesPage() {
  const warranties = await getWarranties();

  return (
    <AppShell activeSection="Warranties">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Warranties"
          title="Keep warranty details easy to find when something breaks."
          description="Review warranty coverage linked to household assets and save metadata when a database is configured."
          action={
            <Button asChild>
              <Link href="/warranties/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add warranty
              </Link>
            </Button>
          }
        />
        <DataSourceNote source={warranties.source} />
        <ReviewSummary
          items={[
            {
              label: "Records",
              value: `${warranties.data.length}`,
              detail: warranties.data.length === 1 ? "Warranty available for review." : "Warranties available for review.",
            },
            {
              label: "Saving",
              value: "Metadata",
              detail: "Warranty create/edit can save when the database is configured. Uploads, reminders and deletes are still off.",
            },
            {
              label: "Data",
              value: warranties.source === "database" ? "Database" : "Sample",
              detail: "Warranty screens remain reviewable without live database access.",
            },
          ]}
        />

        {warranties.data.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {warranties.data.map((warranty) => (
              <Link key={warranty.id} href={`/warranties/${warranty.id}`}>
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{warranty.assetName}</CardTitle>
                    <CardDescription>{warranty.provider || "Provider not recorded"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <Badge variant="secondary">Expires {warranty.expiresAt || "not recorded"}</Badge>
                    <p>Policy: {warranty.policyNumber || "Not recorded"}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No warranties yet"
            description="Add warranty metadata when database saving is configured, or keep reviewing the built-in sample flow when a database is unavailable."
            action={
              <Button asChild>
                <Link href="/warranties/new">Add first warranty</Link>
              </Button>
            }
          />
        )}
      </section>
    </AppShell>
  );
}
