import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { NativeShareButton } from "@/components/native-share-button";
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

  const assetData = asset.data;
  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Assets"
          title={assetData.name}
          description="Asset detail with database-backed editing when persistence is configured."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <BackLinkButton href="/vault/assets">Back to assets</BackLinkButton>
              <NativeShareButton
                title={assetData.name}
                path={`/vault/assets/${assetData.id}`}
                description="View this household asset in HomeVault."
              />
              <Button asChild variant="outline">
                <Link href={`/vault/assets/${assetData.id}/edit`}>Edit asset</Link>
              </Button>
            </div>
          }
        />
        <DataSourceNote source={asset.source} />

        <Card>
          <CardHeader>
            <CardTitle>Asset information</CardTitle>
            <CardDescription>
              <Badge variant="secondary">{getDisplayLabel(assetData.status)}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Brand", value: assetData.brand },
                { label: "Model", value: assetData.model },
                { label: "Serial number", value: assetData.serialNumber },
                { label: "Room", value: assetData.roomName },
                { label: "Category", value: assetData.categoryName },
                { label: "Purchase date", value: assetData.purchaseDate },
                { label: "Purchase place", value: assetData.purchasePlace },
                { label: "Notes", value: assetData.notes },
              ]}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
              <CardDescription>Care tasks linked to this asset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {assetData.maintenanceTasks.length ? (
                assetData.maintenanceTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/maintenance/${task.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <span>
                      <span className="block font-medium text-foreground">{task.title}</span>
                      <span className="block text-muted-foreground">
                        {task.nextDueDate ? `Due ${task.nextDueDate}` : "No due date recorded"}
                      </span>
                    </span>
                    <Badge variant="secondary">{getDisplayLabel(task.status)}</Badge>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">No maintenance tasks are linked yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reminders</CardTitle>
              <CardDescription>Recorded follow-ups linked to this asset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {assetData.reminders.length ? (
                assetData.reminders.map((reminder) => (
                  <Link
                    key={reminder.id}
                    href={`/maintenance/reminders/${reminder.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <span>
                      <span className="block font-medium text-foreground">{reminder.title}</span>
                      <span className="block text-muted-foreground">Due {reminder.dueAt}</span>
                    </span>
                    <Badge variant="secondary">{getDisplayLabel(reminder.status)}</Badge>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">No reminders are linked yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Warranties</CardTitle>
              <CardDescription>Coverage linked to this asset.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {assetData.warranties.length ? (
                assetData.warranties.map((warranty) => (
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
              {assetData.receipts.length ? (
                assetData.receipts.map((receipt) => (
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
              {assetData.documents.length ? (
                assetData.documents.map((document) => (
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
