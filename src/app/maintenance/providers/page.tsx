import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { ProviderFilters } from "@/components/provider-filters";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  searchParams: Promise<{
    q?: string | string[];
    trade?: string | string[];
    workload?: string | string[];
    contact?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = getQueryParam(params.q);
  const trade = getQueryParam(params.trade);
  const workload = getQueryParam(params.workload);
  const contact = getQueryParam(params.contact);
  const providers = await getServiceProviders();
  const visibleProviders = providers.data.filter(
    (provider) =>
      matchesQuery(query, [
        provider.name,
        provider.trade,
        provider.phone,
        provider.email,
        provider.website,
        provider.notes,
        ...provider.tasks.map((task) => task.title),
      ]) &&
      (!trade || (trade === "unassigned" ? !provider.trade : provider.trade === trade)) &&
      (!workload ||
        (workload === "linked" ? provider.tasks.length > 0 : provider.tasks.length === 0)) &&
      (!contact ||
        (contact === "available"
          ? Boolean(provider.phone || provider.email || provider.website)
          : !provider.phone && !provider.email && !provider.website)),
  );
  const tradeOptions = Array.from(
    new Set(
      providers.data
        .map((provider) => provider.trade)
        .filter((value): value is string => Boolean(value)),
    ),
  )
    .map((value) => ({ value, label: value }))
    .sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const hasFilters = Boolean(query || trade || workload || contact);
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
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>
              <Button asChild>
                <Link href="/maintenance/providers/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add provider
                </Link>
              </Button>
            </div>
          }
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

        <ProviderFilters
          query={query}
          trade={trade}
          workload={workload}
          contact={contact}
          tradeOptions={tradeOptions}
          resultCount={visibleProviders.length}
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
            title={hasFilters ? "No providers match these filters" : "No service providers yet"}
            description={
              hasFilters
                ? "Try another search or filter combination, or clear the current filters."
                : "Add a trusted service contact to link with maintenance work."
            }
            action={
              hasFilters ? (
                <BackLinkButton href="/maintenance/providers">Clear filters</BackLinkButton>
              ) : (
                <Button asChild>
                  <Link href="/maintenance/providers/new">Add provider</Link>
                </Button>
              )
            }
          />
        )}
      </section>
    </AppShell>
  );
}
