import { isCurrentHouseholdWritable } from "@/lib/household-access";

import type { Metadata } from "next";

import { createMaintenanceTaskAction } from "@/app/maintenance/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { MaintenanceTaskForm } from "@/components/maintenance-form";
import { PageHeader } from "@/components/page-header";
import { getAssets, getServiceProviders } from "@/lib/home-data";
import { applyMaintenanceTemplate, getMaintenanceTemplate } from "@/lib/maintenance-templates";
import { maintenanceTaskShellFields, withFieldOptions } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "New Maintenance Task",
  description: "Create a HomeVault maintenance task when database persistence is configured.",
};

export const dynamic = "force-dynamic";

export default async function NewMaintenanceTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string | string[] }>;
}) {
  const templateParam = (await searchParams).template;
  const template = getMaintenanceTemplate(
    typeof templateParam === "string" ? templateParam : undefined,
  );
  const [assets, providers] = await Promise.all([getAssets(), getServiceProviders()]);
  const assetFields = withFieldOptions(
    maintenanceTaskShellFields,
    "assetName",
    assets.data.map((asset) => asset.name),
    "No linked asset",
  );
  const optionFields = withFieldOptions(
    assetFields,
    "serviceProviderName",
    providers.data.map((provider) => provider.name),
    "No linked service provider",
  );
  const fields = applyMaintenanceTemplate(optionFields, template);
  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title="Create maintenance task"
          description={
            template
              ? `Review the ${template.title.toLowerCase()} starting point and adjust it for your home before saving.`
              : "Save a household upkeep task when controlled database persistence is available."
          }
          action={<BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>}
        />
        <MaintenanceTaskForm
          title="Task details"
          description="Maintenance task saving is enabled when the database is configured. If the database is unavailable, HomeVault will explain that nothing changed."
          fields={fields}
          action={createMaintenanceTaskAction}
          databaseConfigured={await isCurrentHouseholdWritable()}
        />
      </section>
    </AppShell>
  );
}
