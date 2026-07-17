import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { EmptyState } from "@/components/empty-state";
import { WarrantyFilters } from "@/components/warranty-filters";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDateStatus } from "@/lib/date-status";
import { getWarranties } from "@/lib/home-data";
import { getQueryParam, matchesQuery } from "@/lib/list-filter";

export const metadata: Metadata = {
  title: "Warranties",
  description: "Review warranty records linked to household assets in HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function WarrantiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    coverage?: string | string[];
    asset?: string | string[];
    provider?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = getQueryParam(params.q);
  const coverage = getQueryParam(params.coverage);
  const asset = getQueryParam(params.asset);
  const provider = getQueryParam(params.provider);
  const warranties = await getWarranties();
  const visibleWarranties = warranties.data.filter(
    (warranty) =>
      matchesQuery(query, [
        warranty.assetName,
        warranty.provider,
        warranty.policyNumber,
        warranty.expiresAt,
      ]) &&
      (!coverage || getDateStatus(warranty.expiresAtInput, "warranty").tone === coverage) &&
      (!asset || warranty.assetId === asset) &&
      (!provider ||
        (provider === "unassigned" ? !warranty.provider : warranty.provider === provider)),
  );
  const assetOptions = Array.from(
    new Map(
      warranties.data.map((warranty) => [warranty.assetId, warranty.assetName]),
    ),
    ([value, label]) => ({ value, label }),
  ).sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const providerOptions = Array.from(
    new Set(
      warranties.data
        .map((warranty) => warranty.provider)
        .filter((value): value is string => Boolean(value)),
    ),
  )
    .map((value) => ({ value, label: value }))
    .sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const hasFilters = Boolean(query || coverage || asset || provider);

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

        <WarrantyFilters
          query={query}
          coverage={coverage}
          asset={asset}
          provider={provider}
          assetOptions={assetOptions}
          providerOptions={providerOptions}
          resultCount={visibleWarranties.length}
        />

        {visibleWarranties.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleWarranties.map((warranty) => (
              <Link key={warranty.id} href={`/warranties/${warranty.id}`}>
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{warranty.assetName}</CardTitle>
                    <CardDescription>{warranty.provider || "Provider not recorded"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-2">
                      <DateStatusBadge
                        status={getDateStatus(warranty.expiresAtInput, "warranty")}
                      />
                      <span>Expires {warranty.expiresAt || "not recorded"}</span>
                    </div>
                    <p>Policy: {warranty.policyNumber || "Not recorded"}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={hasFilters ? "No matching warranties" : "No warranties yet"}
            description={
              hasFilters
                ? "Try another search or filter combination, or clear the current filters."
                : "Add warranty metadata when database saving is configured, or keep reviewing the built-in sample flow when a database is unavailable."
            }
            action={
              <Button asChild>
                <Link href={hasFilters ? "/warranties" : "/warranties/new"}>
                  {hasFilters ? "Clear filters" : "Add first warranty"}
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </AppShell>
  );
}
