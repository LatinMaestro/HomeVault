import { isPreviewDatabaseEnabled } from "@/lib/db";

import type { Metadata } from "next";

import { updateWarrantyAction } from "@/app/warranties/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { WarrantyForm } from "@/components/warranty-form";
import { getAssets, getWarranty } from "@/lib/home-data";
import { getWarrantyEditShellFields, withFieldOptions } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "Edit Warranty",
  description: "Edit a HomeVault warranty record when database persistence is configured.",
};

export const dynamic = "force-dynamic";

export default async function EditWarrantyPage({
  params,
}: {
  params: Promise<{ warrantyId: string }>;
}) {
  const { warrantyId } = await params;
  const [warranty, assets] = await Promise.all([getWarranty(warrantyId), getAssets()]);
  const fields = withFieldOptions(
    getWarrantyEditShellFields(warranty.data),
    "assetName",
    assets.data.map((asset) => asset.name),
    "Choose an asset",
  );
  const updateAction = updateWarrantyAction.bind(null, warrantyId);

  return (
    <AppShell activeSection="Warranties">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Warranties"
          title={`Edit ${warranty.data?.assetName ?? "warranty"}`}
          description="Save warranty metadata when database persistence is available. Sample or unavailable database states remain safe and non-destructive."
          action={<BackLinkButton href="/warranties">Back to warranties</BackLinkButton>}
        />
        <WarrantyForm
          title="Warranty details"
          description="Warranty saving is enabled when this warranty exists in the configured database. If this is sample data, HomeVault will explain that nothing changed."
          fields={fields}
          action={updateAction}
          databaseConfigured={isPreviewDatabaseEnabled()}
        />
      </section>
    </AppShell>
  );
}
