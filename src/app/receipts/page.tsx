import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { RecordFilters } from "@/components/record-filters";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayLabel } from "@/lib/display-labels";
import { getRecords } from "@/lib/home-data";
import { getQueryParam, matchesQuery } from "@/lib/list-filter";

export const metadata: Metadata = {
  title: "Receipts and Documents",
  description: "Review metadata-only receipt and home document records in HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    asset?: string | string[];
    documentType?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = getQueryParam(params.q);
  const recordType = getQueryParam(params.type);
  const asset = getQueryParam(params.asset);
  const documentType = getQueryParam(params.documentType);
  const records = await getRecords();
  const visibleRecords = records.data.filter(
    (record) =>
      matchesQuery(query, [
        record.title,
        record.type,
        record.secondary,
        getDisplayLabel(record.secondary),
        record.date,
        record.linkedAsset,
        record.amount,
      ]) &&
      (!recordType || record.type === recordType) &&
      (!asset ||
        (asset === "unassigned" ? !record.linkedAssetId : record.linkedAssetId === asset)) &&
      (!documentType ||
        (record.type === "Document" && record.documentType === documentType)),
  );
  const assetOptions = Array.from(
    new Map(
      records.data
        .filter((record) => record.linkedAssetId && record.linkedAsset)
        .map((record) => [record.linkedAssetId as string, record.linkedAsset as string]),
    ),
    ([value, label]) => ({ value, label }),
  ).sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const documentTypeOptions = Array.from(
    new Set(
      records.data
        .filter((record) => record.type === "Document")
        .map((record) => record.documentType)
        .filter((value): value is string => Boolean(value)),
    ),
  )
    .map((value) => ({ value, label: getDisplayLabel(value) ?? value }))
    .sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const hasFilters = Boolean(query || recordType || asset || documentType);

  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Receipts"
          title="A calm place for receipts and important home documents."
          description="Review and save receipt or document metadata when a database is configured. Uploads and production file storage remain out of scope."
          action={
            <Button asChild>
              <Link href="/receipts/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add record
              </Link>
            </Button>
          }
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
              detail: "Metadata create/edit can save when the database is configured. Files and deletes remain disabled.",
            },
            {
              label: "Data",
              value: records.source === "database" ? "Database" : "Sample",
              detail: "Receipt and document screens stay useful without a live database.",
            },
          ]}
        />

        <RecordFilters
          query={query}
          recordType={recordType}
          asset={asset}
          documentType={documentType}
          assetOptions={assetOptions}
          documentTypeOptions={documentTypeOptions}
          resultCount={visibleRecords.length}
        />

        {visibleRecords.length > 0 ? (
          <div className="grid gap-4">
            {visibleRecords.map((record) => (
              <Link key={record.id} href={`/receipts/${record.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle>{record.title}</CardTitle>
                        <CardDescription>{getDisplayLabel(record.secondary)}</CardDescription>
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
            title={hasFilters ? "No matching records" : "No receipt or document records yet"}
            description={
              hasFilters
                ? "Try another search or filter combination, or clear the current filters."
                : "Add receipt or document metadata when database saving is configured. File uploads and storage remain out of scope."
            }
            action={
              <Button asChild>
                <Link href={hasFilters ? "/receipts" : "/receipts/new"}>
                  {hasFilters ? "Clear filters" : "Add first record"}
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </AppShell>
  );
}

