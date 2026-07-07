import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecord } from "@/lib/home-data";

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
        <PageHeader
          eyebrow="Receipts"
          title="Record not found"
          description="This record was not found in the database or sample data."
        />
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow={record.data.type}
          title={record.data.title}
          description="Metadata-only record detail. File uploads and storage remain out of scope."
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
                { label: "Details", value: record.data.secondary },
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
