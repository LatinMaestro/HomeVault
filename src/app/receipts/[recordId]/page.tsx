import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { DocumentAttachmentPanel } from "@/components/document-attachment-panel";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { NativeShareButton } from "@/components/native-share-button";
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

  const recordData = record.data;
  const attachmentDocument =
    recordData.type === "Document"
      ? {
          id: recordData.id,
          fileName: recordData.hasAttachment ? recordData.fileName : null,
          contentType: recordData.attachmentContentType,
          sizeBytes: recordData.attachmentSizeBytes,
          uploadedAt: recordData.attachmentUploadedAt,
        }
      : recordData.relatedDocuments
          ?.filter((document) => document.type === "RECEIPT")
          .map((document) => ({
            id: document.id,
            fileName: document.hasAttachment ? document.fileName : null,
            contentType: document.attachmentContentType,
            sizeBytes: document.attachmentSizeBytes,
            uploadedAt: document.attachmentUploadedAt,
          }))[0];
  const connectedDocuments =
    recordData.relatedDocuments?.filter(
      (document) => recordData.type !== "Receipt" || document.type !== "RECEIPT",
    ) ?? [];
  const attachmentEnabled =
    Boolean(attachmentDocument) &&
    record.source === "database" &&
    isAuthRuntimeConfigured() &&
    isAttachmentStorageConfigured() &&
    (await isCurrentHouseholdWritable());

  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow={recordData.type}
          title={recordData.title}
          description="Household record detail with guarded metadata editing and private attachments when production services are connected."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <BackLinkButton href="/receipts">Back to receipts</BackLinkButton>
              <NativeShareButton
                title={recordData.title}
                path={`/receipts/${recordData.id}`}
                description="View this household record in HomeVault."
              />
              <Button asChild variant="outline">
                <Link href={`/receipts/${recordData.id}/edit`}>Edit metadata</Link>
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
                { label: "Type", value: recordData.type },
                { label: "Details", value: getDisplayLabel(recordData.secondary) },
                { label: "Date", value: recordData.date },
                { label: "Linked asset", value: recordData.linkedAsset },
                { label: "Amount", value: recordData.amount },
                { label: "File name", value: recordData.fileName },
                { label: "Notes", value: recordData.notes },
              ]}
            />
          </CardContent>
        </Card>

        {attachmentDocument ? (
          <DocumentAttachmentPanel
            documentId={attachmentDocument.id}
            fileName={attachmentDocument.fileName}
            contentType={attachmentDocument.contentType}
            sizeBytes={attachmentDocument.sizeBytes}
            uploadedAt={attachmentDocument.uploadedAt}
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
            {recordData.linkedAssetId ||
            recordData.linkedWarrantyId ||
            recordData.linkedReceiptId ||
            recordData.linkedMaintenanceTaskId ||
            connectedDocuments.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {recordData.linkedAssetId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/vault/assets/${recordData.linkedAssetId}`}>
                        Asset: {recordData.linkedAsset}
                      </Link>
                    </Button>
                  ) : null}
                  {recordData.linkedWarrantyId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/warranties/${recordData.linkedWarrantyId}`}>
                        Warranty: {recordData.linkedWarranty}
                      </Link>
                    </Button>
                  ) : null}
                  {recordData.linkedReceiptId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/receipts/${recordData.linkedReceiptId}`}>
                        Receipt: {recordData.linkedReceipt}
                      </Link>
                    </Button>
                  ) : null}
                  {recordData.linkedMaintenanceTaskId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/maintenance/${recordData.linkedMaintenanceTaskId}`}>
                        Maintenance: {recordData.linkedMaintenanceTask}
                      </Link>
                    </Button>
                  ) : null}
                </div>

                {connectedDocuments.length ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Related documents</p>
                    {connectedDocuments.map((document) => (
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