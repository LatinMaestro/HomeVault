import type { Metadata } from "next";

import { createMaintenanceTaskAction } from "@/app/maintenance/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { MaintenanceTaskForm } from "@/components/maintenance-form";
import { PageHeader } from "@/components/page-header";
import { maintenanceTaskShellFields } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "New Maintenance Task",
  description: "Create a HomeVault maintenance task when database persistence is configured.",
};

export default function NewMaintenanceTaskPage() {
  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title="Create maintenance task"
          description="Save a household upkeep task when database persistence is available. Reminders and recurrence automation are not enabled yet."
          action={<BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>}
        />
        <MaintenanceTaskForm
          title="Task details"
          description="Maintenance task saving is enabled when the database is configured. If the database is unavailable, HomeVault will explain that nothing changed."
          fields={maintenanceTaskShellFields}
          action={createMaintenanceTaskAction}
          databaseConfigured={Boolean(process.env.DATABASE_URL)}
        />
      </section>
    </AppShell>
  );
}
