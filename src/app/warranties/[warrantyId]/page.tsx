import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWarranty } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Warranty Detail",
  description: "Review a read-only HomeVault warranty record.",
};

export const dynamic = "force-dynamic";

export default async function WarrantyPage({
  params,
}: {
  params: Promise<{ warrantyId: string }>;
}) {
  const { warrantyId } = await params;
  const warranty = await getWarranty(warrantyId);

  if (!warranty.data) {
    return (
      <AppShell activeSection="Warranties">
        <section className="space-y-5">
          <PageHeader
            eyebrow="Warranties"
            title="Warranty not found"
            description="This warranty was not found in the current HomeVault data source."
          />
          <DataSourceNote source={warranty.source} />
          <EmptyState
            title="No matching warranty"
            description="The warranty may have been removed, may not exist in the configured database, or may not be part of the built-in sample data."
            action={
              <Button asChild variant="outline">
                <Link href="/warranties">Back to warranties</Link>
              </Button>
            }
          />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Warranties">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Warranties"
          title={warranty.data.assetName}
          description="Read-only warranty detail."
          action={
            <Button asChild variant="outline">
              <Link href="/warranties">Back to warranties</Link>
            </Button>
          }
        />
        <DataSourceNote source={warranty.source} />

        <Card>
          <CardHeader>
            <CardTitle>Warranty information</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Provider", value: warranty.data.provider },
                { label: "Policy number", value: warranty.data.policyNumber },
                { label: "Starts", value: warranty.data.startsAt },
                { label: "Expires", value: warranty.data.expiresAt },
                { label: "Notes", value: warranty.data.notes },
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}