import { isPreviewDatabaseEnabled } from "@/lib/db";

import type { Metadata } from "next";

import { createDocumentAction } from "@/app/receipts/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { getAssets } from "@/lib/home-data";
import { RecordMetadataForm } from "@/components/record-metadata-form";
import { documentShellFields, withFieldOptions } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "New Document Record",
  description: "Create document metadata when HomeVault database persistence is configured.",
};

export const dynamic = "force-dynamic";

export default async function NewDocumentPage() {
  const assets = await getAssets();
  const fields = withFieldOptions(
    documentShellFields,
    "assetName",
    assets.data.map((asset) => asset.name),
    "No linked asset",
  );
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
          fields={fields}
          action={createDocumentAction}
          databaseConfigured={isPreviewDatabaseEnabled()}
        />
      </section>
    </AppShell>
  );
}
