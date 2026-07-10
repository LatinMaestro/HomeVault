import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayLabel } from "@/lib/display-labels";
import { getRecord } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Receipt or Document Detail",
  description: "Review a metadata-only HomeVault receipt or document record.",
};

export const dynamic = "force-dynamic";

export default async function RecordPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const record = await getRecord(recordId);

  if (!record.data) {
    return (
      <AppShell activeSection="Receipts">
        <section className="space-y-5">
          <PageHeader
            eyebrow="Receipts"
            title="Record not found"
            description="This receipt or document record was not found in the current HomeVault data source."
          />
          <DataSourceNote source={record.source} />
          <EmptyState
            title="No matching record"
            description="The record may have been removed, may not exist in the configured database, or may not be part of the built-in sample data."
            action={<BackLinkButton href="/receipts">Back to receipts</BackLinkButton>}
          />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow={record.data.type}
          title={record.data.title}
          description="Metadata-only record detail with database-backed editing when persistence is configured. File uploads and storage remain out of scope."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <BackLinkButton href="/receipts">Back to receipts</BackLinkButton>
              <Button asChild variant="outline">
                <Link href={`/receipts/${record.data.id}/edit`}>Edit metadata</Link>
              </Button>
            </div>
          }
        />
        <DataSourceNote source={record.source} />

        <Card>
          <CardHeader>
            <CardTitle>Record information</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Type", value: record.data.type },
                { label: "Details", value: getDisplayLabel(record.data.secondary) },
                { label: "Date", value: record.data.date },
                { label: "Linked asset", value: record.data.linkedAsset },
                { label: "Amount", value: record.data.amount },
                { label: "File name", value: record.data.fileName },
                { label: "Notes", value: record.data.notes },
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}