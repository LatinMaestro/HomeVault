import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecords } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Receipts and Documents",
  description: "Review metadata-only receipt and home document records in HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const records = await getRecords();

  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Receipts"
          title="A calm place for receipts and important home documents."
          description="These screens show metadata only. Uploads and production file storage remain out of scope."
        />
        <DataSourceNote source={records.source} />
        <ReviewSummary
          items={[
            {
              label: "Records",
              value: `${records.data.length}`,
              detail: records.data.length === 1 ? "Metadata record available for review." : "Metadata records available for review.",
            },
            {
              label: "Mode",
              value: "Metadata",
              detail: "File uploads and storage remain deliberately disabled.",
            },
            {
              label: "Data",
              value: records.source === "database" ? "Database" : "Sample",
              detail: "Receipt and document screens stay useful without a live database.",
            },
          ]}
        />

        {records.data.length > 0 ? (
          <div className="grid gap-4">
            {records.data.map((record) => (
              <Link key={record.id} href={`/receipts/${record.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle>{record.title}</CardTitle>
                        <CardDescription>{record.secondary}</CardDescription>
                      </div>
                      <Badge variant="secondary">{record.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{record.date || "No date"}</span>
                    {record.linkedAsset ? <span>{record.linkedAsset}</span> : null}
                    {record.amount ? <span>{record.amount}</span> : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No receipt or document records yet"
            description="Metadata-only records will appear here once saving is approved. File uploads and storage remain out of scope."
          />
        )}
      </section>
    </AppShell>
  );
}

