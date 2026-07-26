import { isCurrentHouseholdWritable } from "@/lib/household-access";
import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import { isAttachmentStorageConfigured } from "@/lib/attachment-storage";

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
  const [assets, writable] = await Promise.all([
    getAssets(),
    isCurrentHouseholdWritable(),
  ]);
  const attachmentEnabled =
    writable && isAuthRuntimeConfigured() && isAttachmentStorageConfigured();
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
          description="Save document details and optionally attach the private PDF or image in the same step."
          action={<BackLinkButton href="/receipts/new">Change record type</BackLinkButton>}
        />
        <RecordMetadataForm
          recordType="document"
          title="Document details"
          description="Add a clear title and document type, then choose the private file before saving."
          fields={fields}
          action={createDocumentAction}
          databaseConfigured={writable}
          allowAttachment
          attachmentEnabled={attachmentEnabled}
        />
      </section>
    </AppShell>
  );
}
