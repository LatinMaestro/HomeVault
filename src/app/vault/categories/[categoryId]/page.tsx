import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDisplayLabel } from "@/lib/display-labels";
import { getAssetCategory } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Asset Category Detail",
  description: "Review a HomeVault asset category and its household assets.",
};

export const dynamic = "force-dynamic";

export default async function AssetCategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const category = await getAssetCategory(categoryId);

  if (!category.data) {
    return (
      <AppShell activeSection="Vault">
        <section className="space-y-5">
          <PageHeader
            eyebrow="Asset categories"
            title="Category not found"
            description="This category was not found in the current HomeVault data source."
          />
          <DataSourceNote source={category.source} />
          <EmptyState
            title="No matching category"
            description="The category may no longer exist in the configured database or may not be part of the built-in sample household."
            action={
              <BackLinkButton href="/vault/categories">Back to categories</BackLinkButton>
            }
          />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Asset categories"
          title={category.data.name}
          description={
            category.data.description ||
            "Review the household assets organised in this category."
          }
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <BackLinkButton href="/vault/categories">Back to categories</BackLinkButton>
              <Button asChild variant="outline">
                <Link href={`/vault/categories/${category.data.id}/edit`}>
                  Edit category
                </Link>
              </Button>
            </div>
          }
        />
        <DataSourceNote source={category.source} />

        <section className="space-y-3" aria-labelledby="category-assets">
          <div>
            <h2 id="category-assets" className="text-lg font-semibold">
              Assets
            </h2>
            <p className="text-sm text-muted-foreground">
              {category.data.assets.length === 1
                ? "1 household asset uses this category."
                : `${category.data.assets.length} household assets use this category.`}
            </p>
          </div>

          {category.data.assets.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {category.data.assets.map((asset) => (
                <Link key={asset.id} href={`/vault/assets/${asset.id}`}>
                  <Card className="h-full transition-colors hover:bg-accent">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle>{asset.name}</CardTitle>
                          <CardDescription>
                            {asset.brand || "Brand not recorded"}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {getDisplayLabel(asset.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {asset.roomName || "Room not assigned"}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No assets in this category"
              description="Assign this category while creating or editing an asset."
              action={
                <Button asChild variant="outline">
                  <Link href="/vault/assets/new">Add asset</Link>
                </Button>
              }
            />
          )}
        </section>
      </section>
    </AppShell>
  );
}
