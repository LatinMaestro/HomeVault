import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWarranty } from "@/lib/home-data";

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
        <PageHeader
          eyebrow="Warranties"
          title="Warranty not found"
          description="This warranty was not found in the database or sample data."
        />
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Warranties">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Warranties"
          title={warranty.data.assetName}
          description="Read-only warranty detail for Phase 1C."
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
