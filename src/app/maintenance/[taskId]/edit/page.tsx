import { isCurrentHouseholdWritable } from "@/lib/household-access";

import type { Metadata } from "next";

import { updateMaintenanceTaskAction } from "@/app/maintenance/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { MaintenanceTaskForm } from "@/components/maintenance-form";
import { PageHeader } from "@/components/page-header";
import { getAssets, getMaintenanceTask, getServiceProviders } from "@/lib/home-data";
import { getMaintenanceTaskEditShellFields, withFieldOptions } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "Edit Maintenance Task",
  description: "Edit a HomeVault maintenance task when database persistence is configured.",
};

export const dynamic = "force-dynamic";

export default async function EditMaintenanceTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const [task, assets, providers] = await Promise.all([
    getMaintenanceTask(taskId),
    getAssets(),
    getServiceProviders(),
  ]);
  const assetFields = withFieldOptions(
    getMaintenanceTaskEditShellFields(task.data),
    "assetName",
    assets.data.map((asset) => asset.name),
    "No linked asset",
  );
  const fields = withFieldOptions(
    assetFields,
    "serviceProviderName",
    providers.data.map((provider) => provider.name),
    "No linked service provider",
  );
  const updateAction = updateMaintenanceTaskAction.bind(null, taskId);

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title={`Edit ${task.data?.title ?? "maintenance task"}`}
          description="Save maintenance changes when database persistence is available. Sample or unavailable database states remain safe and non-destructive."
          action={<BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>}
        />
        <MaintenanceTaskForm
          title="Task details"
          description="Maintenance saving is enabled when this task exists in the configured database. If this is sample data, HomeVault will explain that nothing changed."
          fields={fields}
          action={updateAction}
          databaseConfigured={await isCurrentHouseholdWritable()}
        />
      </section>
    </AppShell>
  );
}
