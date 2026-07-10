import type { Metadata } from "next";

import { createDocumentAction } from "@/app/receipts/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { RecordMetadataForm } from "@/components/record-metadata-form";
import { documentShellFields } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "New Document Record",
  description: "Create document metadata when HomeVault database persistence is configured.",
};

export default function NewDocumentPage() {
  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Document"
          title="Add document metadata"
          description="Save a description of an important home document. No file is selected, uploaded or stored."
          action={<BackLinkButton href="/receipts/new">Change record type</BackLinkButton>}
        />
        <RecordMetadataForm
          recordType="document"
          title="Document details"
          description="Add a clear title and supported document type. File handling remains disabled."
          fields={documentShellFields}
          action={createDocumentAction}
          databaseConfigured={Boolean(process.env.DATABASE_URL)}
        />
      </section>
    </AppShell>
  );
}
