import { isCurrentHouseholdWritable } from "@/lib/household-access";

import type { Metadata } from "next";

import { updateAssetCategoryAction } from "@/app/vault/categories/actions";
import { AppShell } from "@/components/app-shell";
import { AssetCategoryForm } from "@/components/asset-category-form";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { getAssetCategoryFields } from "@/lib/asset-category-fields";
import { getAssetCategories } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Edit Asset Category",
  description: "Edit an asset category in the current HomeVault home.",
};

export const dynamic = "force-dynamic";

export default async function EditAssetCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const categories = await getAssetCategories();
  const category = categories.data.find((item) => item.id === categoryId) ?? null;
  const updateAction = updateAssetCategoryAction.bind(null, categoryId);

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Asset categories"
          title={`Edit ${category?.name ?? "category"}`}
          description="Rename or clarify this category when it exists in the configured database."
          action={<BackLinkButton href="/vault/categories">Back to categories</BackLinkButton>}
        />
        <AssetCategoryForm
          fields={getAssetCategoryFields(category)}
          action={updateAction}
          databaseConfigured={await isCurrentHouseholdWritable()}
        />
      </section>
    </AppShell>
  );
}
