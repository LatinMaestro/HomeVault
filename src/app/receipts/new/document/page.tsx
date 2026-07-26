import { isCurrentHouseholdWritable } from "@/lib/household-access";

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
          description="First save the document details. HomeVault will then open the saved record so you can choose and privately upload the file."
          action={<BackLinkButton href="/receipts/new">Change record type</BackLinkButton>}
        />
        <RecordMetadataForm
          recordType="document"
          title="Document details"
          description="Step 1 of 2: add a clear title and document type. The private file selector appears immediately after these details are saved."
          fields={fields}
          action={createDocumentAction}
          databaseConfigured={await isCurrentHouseholdWritable()}
        />
      </section>
    </AppShell>
  );
}
