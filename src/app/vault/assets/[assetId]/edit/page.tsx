import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ShellForm } from "@/components/shell-form";
import { getAsset } from "@/lib/home-data";

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
        />
        <ShellForm
          title="Asset details"
          description="Saving is intentionally disabled until persistent CRUD is approved."
          fields={[
            { label: "Asset name", name: "name", defaultValue: asset.data?.name, placeholder: "French door fridge" },
            { label: "Brand", name: "brand", defaultValue: asset.data?.brand ?? "", placeholder: "Fisher & Paykel" },
            { label: "Model", name: "model", defaultValue: asset.data?.model ?? "", placeholder: "RF605QDUVX1" },
            { label: "Room", name: "room", defaultValue: asset.data?.roomName ?? "", placeholder: "Kitchen" },
            { label: "Notes", name: "notes", defaultValue: asset.data?.notes ?? "", multiline: true },
          ]}
        />
      </section>
    </AppShell>
  );
}