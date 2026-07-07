import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssets } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const assets = await getAssets();

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

        <div className="grid gap-4 md:grid-cols-2">
          {assets.data.map((asset) => (
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
                    <Badge variant="secondary">{asset.status}</Badge>
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
      </section>
    </AppShell>
  );
}
