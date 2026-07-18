import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { DocumentAttachmentPanel } from "@/components/document-attachment-panel";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDisplayLabel } from "@/lib/display-labels";
import { getRecord } from "@/lib/home-data";
import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import { isAttachmentStorageConfigured } from "@/lib/attachment-storage";
import { isCurrentHouseholdWritable } from "@/lib/household-access";

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

  const attachmentEnabled =
    record.data.type === "Document" &&
    record.source === "database" &&
    isAuthRuntimeConfigured() &&
    isAttachmentStorageConfigured() &&
    (await isCurrentHouseholdWritable());

  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow={record.data.type}
          title={record.data.title}
          description="Household record detail with guarded metadata editing and private attachments when production services are connected."
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

        {record.data.type === "Document" ? (
          <DocumentAttachmentPanel
            documentId={record.data.id}
            fileName={record.data.hasAttachment ? record.data.fileName : null}
            contentType={record.data.attachmentContentType}
            sizeBytes={record.data.attachmentSizeBytes}
            uploadedAt={record.data.attachmentUploadedAt}
            enabled={attachmentEnabled}
          />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Connected records</CardTitle>
            <CardDescription>
              Existing HomeVault records linked to this metadata entry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.data.linkedAssetId ||
            record.data.linkedWarrantyId ||
            record.data.linkedReceiptId ||
            record.data.linkedMaintenanceTaskId ||
            (record.data.relatedDocuments?.length ?? 0) > 0 ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {record.data.linkedAssetId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/vault/assets/${record.data.linkedAssetId}`}>
                        Asset: {record.data.linkedAsset}
                      </Link>
                    </Button>
                  ) : null}
                  {record.data.linkedWarrantyId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/warranties/${record.data.linkedWarrantyId}`}>
                        Warranty: {record.data.linkedWarranty}
                      </Link>
                    </Button>
                  ) : null}
                  {record.data.linkedReceiptId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/receipts/${record.data.linkedReceiptId}`}>
                        Receipt: {record.data.linkedReceipt}
                      </Link>
                    </Button>
                  ) : null}
                  {record.data.linkedMaintenanceTaskId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/maintenance/${record.data.linkedMaintenanceTaskId}`}>
                        Maintenance: {record.data.linkedMaintenanceTask}
                      </Link>
                    </Button>
                  ) : null}
                </div>

                {record.data.relatedDocuments?.length ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Related documents</p>
                    {record.data.relatedDocuments.map((document) => (
                      <Link
                        key={document.id}
                        href={`/receipts/${document.id}`}
                        className="block min-h-11 rounded-md border bg-background p-3 text-sm transition-colors hover:bg-accent"
                      >
                        <span className="block font-medium text-foreground">{document.title}</span>
                        <span className="block text-muted-foreground">
                          {getDisplayLabel(document.type)}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                This record is not linked to another HomeVault record yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}