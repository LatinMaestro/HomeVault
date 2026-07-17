import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { CategoryFilters } from "@/components/category-filters";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssetCategories } from "@/lib/home-data";
import { getQueryParam, matchesQuery } from "@/lib/list-filter";

export const metadata: Metadata = {
  title: "Asset Categories",
  description: "Manage broad household asset categories in HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function AssetCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    usage?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = getQueryParam(params.q);
  const usage = getQueryParam(params.usage);
  const categories = await getAssetCategories();
  const visibleCategories = categories.data.filter(
    (category) =>
      matchesQuery(query, [category.name, category.description]) &&
      (!usage || (usage === "used" ? category.assetCount > 0 : category.assetCount === 0)),
  );
  const hasFilters = Boolean(query || usage);

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Vault"
          title="Asset categories"
          description="Keep asset organisation broad, familiar and easy for the household to maintain."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <BackLinkButton href="/vault">Back to vault</BackLinkButton>
              <Button asChild>
                <Link href="/vault/categories/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add category
                </Link>
              </Button>
            </div>
          }
        />
        <DataSourceNote source={categories.source} />
        <CategoryFilters
          query={query}
          usage={usage}
          resultCount={visibleCategories.length}
        />

        {visibleCategories.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleCategories.map((category) => (
              <Link key={category.id} href={`/vault/categories/${category.id}`}>
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>{category.name}</CardTitle>
                      <Badge variant="secondary">
                        {category.assetCount} {category.assetCount === 1 ? "asset" : "assets"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {category.description || "No description recorded yet"}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={hasFilters ? "No categories match these filters" : "No asset categories yet"}
            description={
              hasFilters
                ? "Try another search or filter combination, or clear the current filters."
                : "Add a broad category to make assets easier to organise."
            }
            action={
              hasFilters ? (
                <BackLinkButton href="/vault/categories">Clear filters</BackLinkButton>
              ) : (
                <Button asChild>
                  <Link href="/vault/categories/new">Add category</Link>
                </Button>
              )
            }
          />
        )}
      </section>
    </AppShell>
  );
}
