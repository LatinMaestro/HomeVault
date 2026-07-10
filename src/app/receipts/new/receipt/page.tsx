import type { Metadata } from "next";

import { createReceiptAction } from "@/app/receipts/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { RecordMetadataForm } from "@/components/record-metadata-form";
import { receiptShellFields } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "New Receipt",
  description: "Create receipt metadata when HomeVault database persistence is configured.",
};

export default function NewReceiptPage() {
  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Receipt"
          title="Add receipt metadata"
          description="Save purchase reference details when database persistence is available. This does not create a budget or upload a receipt image."
          action={<BackLinkButton href="/receipts/new">Change record type</BackLinkButton>}
        />
        <RecordMetadataForm
          recordType="receipt"
          title="Receipt details"
          description="The merchant is required. Purchase total is optional archival metadata in Australian dollars."
          fields={receiptShellFields}
          action={createReceiptAction}
          databaseConfigured={Boolean(process.env.DATABASE_URL)}
        />
      </section>
    </AppShell>
  );
}
