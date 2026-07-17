import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { AssetFilters } from "@/components/asset-filters";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
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
  searchParams: Promise<{
    q?: string | string[];
    room?: string | string[];
    category?: string | string[];
    status?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = getQueryParam(params.q);
  const room = getQueryParam(params.room);
  const category = getQueryParam(params.category);
  const status = getQueryParam(params.status);
  const assets = await getAssets();
  const visibleAssets = assets.data.filter(
    (asset) =>
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
      ]) &&
      (!room || (room === "unassigned" ? !asset.roomId : asset.roomId === room)) &&
      (!category ||
        (category === "unassigned" ? !asset.categoryId : asset.categoryId === category)) &&
      (!status || asset.status === status),
  );
  const roomOptions = Array.from(
    new Map(
      assets.data
        .filter((asset) => asset.roomId && asset.roomName)
        .map((asset) => [asset.roomId as string, asset.roomName as string]),
    ),
    ([value, label]) => ({ value, label }),
  ).sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const categoryOptions = Array.from(
    new Map(
      assets.data
        .filter((asset) => asset.categoryId && asset.categoryName)
        .map((asset) => [asset.categoryId as string, asset.categoryName as string]),
    ),
    ([value, label]) => ({ value, label }),
  ).sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const statusOptions = Array.from(new Set(assets.data.map((asset) => asset.status)))
    .map((value) => ({ value, label: getDisplayLabel(value) ?? value }))
    .sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const hasFilters = Boolean(query || room || category || status);

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

        <AssetFilters
          query={query}
          room={room}
          category={category}
          status={status}
          roomOptions={roomOptions}
          categoryOptions={categoryOptions}
          statusOptions={statusOptions}
          resultCount={visibleAssets.length}
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
            title={hasFilters ? "No matching assets" : "No assets yet"}
            description={
              hasFilters
                ? "Try another search or filter combination, or clear the current filters."
                : "Assets hold appliances, tools and equipment details. Add the first asset when database saving is configured."
            }
            action={
              <Button asChild variant="outline">
                <Link href={hasFilters ? "/vault/assets" : "/vault/assets/new"}>
                  {hasFilters ? "Clear filters" : "Add asset"}
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </AppShell>
  );
}
