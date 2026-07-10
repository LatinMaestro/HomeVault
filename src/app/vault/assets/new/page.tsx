import type { Metadata } from "next";

import { createAssetAction } from "@/app/vault/assets/actions";
import { AppShell } from "@/components/app-shell";
import { AssetForm } from "@/components/asset-form";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { getRooms } from "@/lib/home-data";
import { assetShellFields, withFieldOptions } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "New Asset",
  description: "Create a HomeVault asset when database persistence is configured.",
};

export const dynamic = "force-dynamic";

export default async function NewAssetPage() {
  const rooms = await getRooms();
  const fields = withFieldOptions(assetShellFields, "room", rooms.data.map((room) => room.name), "No linked room");
  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Assets"
          title="Create asset"
          description="Save an asset for appliances, tools and equipment when database persistence is available."
          action={<BackLinkButton href="/vault/assets">Back to assets</BackLinkButton>}
        />
        <AssetForm
          title="Asset details"
          description="Asset saving is now enabled when the database is configured. If the database is unavailable, HomeVault will explain that nothing changed."
          fields={fields}
          action={createAssetAction}
          databaseConfigured={Boolean(process.env.DATABASE_URL)}
        />
      </section>
    </AppShell>
  );
}