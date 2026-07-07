import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAsset } from "@/lib/home-data";

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
        <PageHeader
          eyebrow="Assets"
          title="Asset not found"
          description="This record was not found in the database or sample data."
        />
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Assets"
          title={asset.data.name}
          description="Read-only asset detail for Phase 1C."
          action={
            <Button asChild variant="outline">
              <Link href={`/vault/assets/${asset.data.id}/edit`}>Edit shell</Link>
            </Button>
          }
        />
        <DataSourceNote source={asset.source} />

        <Card>
          <CardHeader>
            <CardTitle>Asset information</CardTitle>
            <CardDescription>
              <Badge variant="secondary">{asset.data.status}</Badge>
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
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {asset.data.warranties.length ? (
                asset.data.warranties.map((warranty) => (
                  <p key={warranty.id}>{warranty.provider || "Warranty"} · {warranty.expiresAt || "No expiry"}</p>
                ))
              ) : (
                <p>No warranties recorded.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Receipts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {asset.data.receipts.length ? (
                asset.data.receipts.map((receipt) => (
                  <p key={receipt.id}>{receipt.merchant} · {receipt.totalAmount || "No amount"}</p>
                ))
              ) : (
                <p>No receipts recorded.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {asset.data.documents.length ? (
                asset.data.documents.map((document) => (
                  <p key={document.id}>{document.title} · {document.type}</p>
                ))
              ) : (
                <p>No documents recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
