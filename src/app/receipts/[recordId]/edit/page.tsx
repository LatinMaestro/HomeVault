import type { Metadata } from "next";

import { updateDocumentAction, updateReceiptAction } from "@/app/receipts/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RecordMetadataForm } from "@/components/record-metadata-form";
import { getRecord } from "@/lib/home-data";
import { getDocumentEditShellFields, getReceiptEditShellFields } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "Edit Record",
  description: "Edit HomeVault receipt or document metadata when database persistence is configured.",
};

export const dynamic = "force-dynamic";

export default async function EditRecordPage({
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
            description="This receipt or document record is not available in the current data source."
            action={<BackLinkButton href="/receipts">Back to records</BackLinkButton>}
          />
          <EmptyState
            title="Nothing to edit"
            description="The record may not exist in the configured database or built-in sample data."
          />
        </section>
      </AppShell>
    );
  }

  const isReceipt = record.data.type === "Receipt";
  const action = isReceipt
    ? updateReceiptAction.bind(null, recordId)
    : updateDocumentAction.bind(null, recordId);
  const fields = isReceipt
    ? getReceiptEditShellFields(record.data)
    : getDocumentEditShellFields(record.data);

  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow={record.data.type}
          title={`Edit ${record.data.title}`}
          description="The record type stays fixed during editing. Sample or unavailable database states remain safe and non-destructive."
          action={<BackLinkButton href={`/receipts/${recordId}`}>Back to record</BackLinkButton>}
        />
        <RecordMetadataForm
          recordType={isReceipt ? "receipt" : "document"}
          title={isReceipt ? "Receipt details" : "Document details"}
          description={
            isReceipt
              ? "Update archival purchase metadata. No budgeting or payment workflow is created."
              : "Update document metadata only. No file is selected, uploaded or stored."
          }
          fields={fields}
          action={action}
          databaseConfigured={Boolean(process.env.DATABASE_URL)}
        />
      </section>
    </AppShell>
  );
}
