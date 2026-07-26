import { isCurrentHouseholdWritable } from "@/lib/household-access";
import { isAuthRuntimeConfigured } from "@/lib/auth-config";
import { isAttachmentStorageConfigured } from "@/lib/attachment-storage";

import type { Metadata } from "next";

import { createReceiptAction } from "@/app/receipts/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { getAssets } from "@/lib/home-data";
import { RecordMetadataForm } from "@/components/record-metadata-form";
import { receiptShellFields, withFieldOptions } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "New Receipt",
  description: "Create receipt metadata when HomeVault database persistence is configured.",
};

export const dynamic = "force-dynamic";

export default async function NewReceiptPage() {
  const [assets, writable] = await Promise.all([
    getAssets(),
    isCurrentHouseholdWritable(),
  ]);
  const attachmentEnabled =
    writable && isAuthRuntimeConfigured() && isAttachmentStorageConfigured();
  const fields = withFieldOptions(
    receiptShellFields,
    "assetName",
    assets.data.map((asset) => asset.name),
    "No linked asset",
  );
  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Receipt"
          title="Add receipt metadata"
          description="Save purchase reference details and optionally attach the original receipt as a private PDF or image."
          action={<BackLinkButton href="/receipts/new">Change record type</BackLinkButton>}
        />
        <RecordMetadataForm
          recordType="receipt"
          title="Receipt details"
          description="The merchant is required. Purchase total is optional archival metadata in Australian dollars."
          fields={fields}
          action={createReceiptAction}
          databaseConfigured={writable}
          allowAttachment
          attachmentEnabled={attachmentEnabled}
        />
      </section>
    </AppShell>
  );
}
