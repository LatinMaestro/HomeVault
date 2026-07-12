import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { ListSearch } from "@/components/list-search";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayLabel } from "@/lib/display-labels";
import { getServiceProviders } from "@/lib/home-data";
import { getQueryParam, matchesQuery } from "@/lib/list-filter";

export const metadata: Metadata = {
  title: "Service Providers",
  description: "Review service provider contacts and their linked maintenance tasks.",
};

export const dynamic = "force-dynamic";

export default async function ServiceProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const query = getQueryParam((await searchParams).q);
  const providers = await getServiceProviders();
  const visibleProviders = providers.data.filter((provider) =>
    matchesQuery(query, [
      provider.name,
      provider.trade,
      provider.phone,
      provider.email,
      provider.website,
      provider.notes,
      ...provider.tasks.map((task) => task.title),
    ]),
  );
  const linkedTaskCount = providers.data.reduce(
    (total, provider) => total + provider.tasks.length,
    0,
  );

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title="Service providers"
          description="Keep trusted contact details close to the maintenance work they support."
          action={<BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>}
        />
        <DataSourceNote source={providers.source} />
        <ReviewSummary
          items={[
            {
              label: "Providers",
              value: `${providers.data.length}`,
              detail: "Service contacts available for this home.",
            },
            {
              label: "Linked tasks",
              value: `${linkedTaskCount}`,
              detail: "Maintenance tasks connected to a provider.",
            },
            {
              label: "Data",
              value: providers.source === "database" ? "Database" : "Sample",
              detail: "This directory remains useful when a database is unavailable.",
            },
          ]}
        />

        <ListSearch
          action="/maintenance/providers"
          defaultValue={query}
          label="Search service providers"
          placeholder="Search providers, trades or tasks"
          resultCount={visibleProviders.length}
          resultNoun="provider"
        />

        {visibleProviders.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleProviders.map((provider) => (
              <Link key={provider.id} href={`/maintenance/providers/${provider.id}`}>
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{provider.name}</CardTitle>
                    <CardDescription>{provider.trade || "Trade not recorded yet"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>{provider.phone || provider.email || "Contact details not recorded yet"}</p>
                    <Badge variant="secondary">
                      {provider.tasks.length} {provider.tasks.length === 1 ? "linked task" : "linked tasks"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={query ? "No providers match this search" : "No service providers yet"}
            description={
              query
                ? "Try a provider name, trade or linked maintenance task."
                : "Provider creation is not part of this phase. Existing provider records will appear here."
            }
            action={
              query ? <BackLinkButton href="/maintenance/providers">Clear search</BackLinkButton> : undefined
            }
          />
        )}
      </section>
    </AppShell>
  );
}
