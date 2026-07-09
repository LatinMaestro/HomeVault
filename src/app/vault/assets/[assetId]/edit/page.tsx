import type { Metadata } from "next";

import { updateAssetAction } from "@/app/vault/assets/actions";
import { AppShell } from "@/components/app-shell";
import { AssetForm } from "@/components/asset-form";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { getAsset } from "@/lib/home-data";
import { getAssetEditShellFields } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "Edit Asset",
  description: "Edit a HomeVault asset when database persistence is configured.",
};

export const dynamic = "force-dynamic";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;
  const asset = await getAsset(assetId);
  const updateAction = updateAssetAction.bind(null, assetId);

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Assets"
          title={`Edit ${asset.data?.name ?? "asset"}`}
          description="Save asset changes when database persistence is available. Sample or unavailable database states remain safe and non-destructive."
          action={<BackLinkButton href="/vault/assets">Back to assets</BackLinkButton>}
        />
        <AssetForm
          title="Asset details"
          description="Asset saving is now enabled when this asset exists in the configured database. If this is sample data, HomeVault will explain that nothing changed."
          fields={getAssetEditShellFields(asset.data)}
          action={updateAction}
          databaseConfigured={Boolean(process.env.DATABASE_URL)}
        />
      </section>
    </AppShell>
  );
}