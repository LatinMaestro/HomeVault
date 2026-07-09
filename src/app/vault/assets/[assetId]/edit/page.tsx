import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { ShellForm } from "@/components/shell-form";
import { getAsset } from "@/lib/home-data";
import { getAssetEditShellFields } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "Edit Asset Shell",
  description: "Preview the non-saving HomeVault asset edit form.",
};

export const dynamic = "force-dynamic";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;
  const asset = await getAsset(assetId);

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Assets"
          title={`Edit ${asset.data?.name ?? "asset"} shell`}
          description="This edit screen previews the future asset workflow. It does not save records yet."
          action={<BackLinkButton href="/vault/assets">Back to assets</BackLinkButton>}
        />
        <ShellForm
          title="Asset details"
          description="Review the pre-filled asset fields that will support future saving. Saving is intentionally disabled until persistent CRUD is approved."
          fields={getAssetEditShellFields(asset.data)}
        />
      </section>
    </AppShell>
  );
}