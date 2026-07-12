import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { ListSearch } from "@/components/list-search";
import { PageHeader } from "@/components/page-header";
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
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const query = getQueryParam((await searchParams).q);
  const categories = await getAssetCategories();
  const visibleCategories = categories.data.filter((category) =>
    matchesQuery(query, [category.name, category.description]),
  );

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
        <ListSearch
          action="/vault/categories"
          defaultValue={query}
          label="Search asset categories"
          placeholder="Search category names or descriptions"
          resultCount={visibleCategories.length}
          resultNoun="category"
          resultNounPlural="categories"
        />

        {visibleCategories.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleCategories.map((category) => (
              <Link key={category.id} href={`/vault/categories/${category.id}/edit`}>
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
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
            title={query ? "No categories match this search" : "No asset categories yet"}
            description={
              query
                ? "Try a broader category name or description."
                : "Add a broad category to make assets easier to organise."
            }
            action={
              query ? (
                <BackLinkButton href="/vault/categories">Clear search</BackLinkButton>
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
