import { isCurrentHouseholdWritable } from "@/lib/household-access";

import type { Metadata } from "next";

import { createAssetCategoryAction } from "@/app/vault/categories/actions";
import { AppShell } from "@/components/app-shell";
import { AssetCategoryForm } from "@/components/asset-category-form";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { getAssetCategoryFields } from "@/lib/asset-category-fields";

export const metadata: Metadata = {
  title: "New Asset Category",
  description: "Add an asset category to the current HomeVault home.",
};

export default async function NewAssetCategoryPage() {
  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Asset categories"
          title="Add category"
          description="Create a broad label that helps the household find related assets."
          action={<BackLinkButton href="/vault/categories">Back to categories</BackLinkButton>}
        />
        <AssetCategoryForm
          fields={getAssetCategoryFields()}
          action={createAssetCategoryAction}
          databaseConfigured={await isCurrentHouseholdWritable()}
        />
      </section>
    </AppShell>
  );
}
