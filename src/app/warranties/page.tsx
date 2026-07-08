import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWarranties } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Warranties",
  description: "Review warranty records linked to household assets in HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function WarrantiesPage() {
  const warranties = await getWarranties();

  return (
    <AppShell activeSection="Warranties">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Warranties"
          title="Keep warranty details easy to find when something breaks."
          description="Review warranty coverage linked to household assets. These screens are read-only for now."
        />
        <DataSourceNote source={warranties.source} />

        {warranties.data.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {warranties.data.map((warranty) => (
              <Link key={warranty.id} href={`/warranties/${warranty.id}`}>
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardHeader>
                    <CardTitle>{warranty.assetName}</CardTitle>
                    <CardDescription>{warranty.provider || "Provider not recorded"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <Badge variant="secondary">Expires {warranty.expiresAt || "not recorded"}</Badge>
                    <p>Policy: {warranty.policyNumber || "Not recorded"}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No warranties yet"
            description="Warranty records will help track providers, policy numbers and expiry dates once saving is enabled."
          />
        )}
      </section>
    </AppShell>
  );
}
