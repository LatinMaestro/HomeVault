import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { ListSearch } from "@/components/list-search";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayLabel } from "@/lib/display-labels";
import { getAssets } from "@/lib/home-data";
import { getQueryParam, matchesQuery } from "@/lib/list-filter";

export const metadata: Metadata = {
  title: "Assets",
  description: "Browse and manage appliances, tools and equipment tracked in HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const query = getQueryParam((await searchParams).q);
  const assets = await getAssets();
  const visibleAssets = assets.data.filter((asset) =>
    matchesQuery(query, [
      asset.name,
      asset.brand,
      asset.model,
      asset.serialNumber,
      asset.purchasePlace,
      asset.status,
      getDisplayLabel(asset.status),
      asset.roomName,
      asset.categoryName,
      asset.purchaseDate,
    ]),
  );

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Assets"
          title="Household assets"
          description="Browse appliances, tools and equipment linked to rooms, warranties and records."
          action={
            <Button asChild>
              <Link href="/vault/assets/new">New asset</Link>
            </Button>
          }
        />
        <DataSourceNote source={assets.source} />
        <ReviewSummary
          items={[
            {
              label: "Records",
              value: `${assets.data.length}`,
              detail: assets.data.length === 1 ? "Asset available for review." : "Assets available for review.",
            },
            {
              label: "Saving",
              value: "Assets",
              detail: "Asset create/edit can save when the database is configured. Deletes and uploads are still off.",
            },
            {
              label: "Data",
              value: assets.source === "database" ? "Database" : "Sample",
              detail: "Pages stay useful even when a database is not configured.",
            },
          ]}
        />

        <ListSearch
          action="/vault/assets"
          defaultValue={query}
          label="Search assets"
          placeholder="Search assets, serials, rooms or brands"
          resultCount={visibleAssets.length}
          resultNoun="asset"
        />

        {visibleAssets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleAssets.map((asset) => (
              <Link key={asset.id} href={`/vault/assets/${asset.id}`}>
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{asset.name}</CardTitle>
                        <CardDescription>
                          {[asset.brand, asset.model].filter(Boolean).join(" ") || "Details not recorded"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{getDisplayLabel(asset.status)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>{asset.roomName || "No room"} · {asset.categoryName || "No category"}</p>
                    <p>Purchased {asset.purchaseDate || "date not recorded"}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={query ? "No matching assets" : "No assets yet"}
            description={
              query
                ? "Try another asset, brand or room, or clear the current search."
                : "Assets hold appliances, tools and equipment details. Add the first asset when database saving is configured."
            }
            action={
              <Button asChild variant="outline">
                <Link href={query ? "/vault/assets" : "/vault/assets/new"}>
                  {query ? "Clear search" : "Add asset"}
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </AppShell>
  );
}
