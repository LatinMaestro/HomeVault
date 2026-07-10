import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayLabel } from "@/lib/display-labels";
import { getAsset } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Asset Detail",
  description: "Review a HomeVault household asset record.",
};

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;
  const asset = await getAsset(assetId);

  if (!asset.data) {
    return (
      <AppShell activeSection="Vault">
        <section className="space-y-5">
          <PageHeader
            eyebrow="Assets"
            title="Asset not found"
            description="This record was not found in the current HomeVault data source."
          />
          <DataSourceNote source={asset.source} />
          <EmptyState
            title="No matching asset"
            description="The asset may have been removed, may not exist in the configured database, or may not be part of the built-in sample data."
            action={<BackLinkButton href="/vault/assets">Back to assets</BackLinkButton>}
          />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Assets"
          title={asset.data.name}
          description="Asset detail with database-backed editing when persistence is configured."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <BackLinkButton href="/vault/assets">Back to assets</BackLinkButton>
              <Button asChild variant="outline">
                <Link href={`/vault/assets/${asset.data.id}/edit`}>Edit asset</Link>
              </Button>
            </div>
          }
        />
        <DataSourceNote source={asset.source} />

        <Card>
          <CardHeader>
            <CardTitle>Asset information</CardTitle>
            <CardDescription>
              <Badge variant="secondary">{getDisplayLabel(asset.data.status)}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Brand", value: asset.data.brand },
                { label: "Model", value: asset.data.model },
                { label: "Serial number", value: asset.data.serialNumber },
                { label: "Room", value: asset.data.roomName },
                { label: "Category", value: asset.data.categoryName },
                { label: "Purchase date", value: asset.data.purchaseDate },
                { label: "Purchase place", value: asset.data.purchasePlace },
                { label: "Notes", value: asset.data.notes },
              ]}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Warranties</CardTitle>
              <CardDescription>Coverage linked to this asset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {asset.data.warranties.length ? (
                asset.data.warranties.map((warranty) => (
                  <Link
                    key={warranty.id}
                    href={`/warranties/${warranty.id}`}
                    className="block rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <p className="font-medium text-foreground">{warranty.provider || "Warranty"}</p>
                    <p className="text-muted-foreground">Expires {warranty.expiresAt || "not recorded yet"}</p>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">No linked warranty records yet.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Receipts</CardTitle>
              <CardDescription>Purchase metadata linked to this asset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {asset.data.receipts.length ? (
                asset.data.receipts.map((receipt) => (
                  <Link
                    key={receipt.id}
                    href={`/receipts/${receipt.id}`}
                    className="block rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <p className="font-medium text-foreground">{receipt.merchant}</p>
                    <p className="text-muted-foreground">{receipt.totalAmount || "Amount not recorded yet"}</p>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">No linked receipt records yet.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Metadata-only documents linked to this asset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {asset.data.documents.length ? (
                asset.data.documents.map((document) => (
                  <Link
                    key={document.id}
                    href={`/receipts/${document.id}`}
                    className="block rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <p className="font-medium text-foreground">{document.title}</p>
                    <p className="text-muted-foreground">{getDisplayLabel(document.type)}</p>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">No linked document records yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
