import { isPreviewDatabaseEnabled } from "@/lib/db";

import type { Metadata } from "next";

import { createReminderAction } from "@/app/maintenance/reminders/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { ReminderForm } from "@/components/reminder-form";
import { getAssets, getMaintenanceTasks, getWarranties } from "@/lib/home-data";
import { getReminderFields } from "@/lib/reminder-fields";

export const metadata: Metadata = {
  title: "New Reminder",
  description: "Add reminder metadata without notification delivery.",
};

export const dynamic = "force-dynamic";

export default async function NewReminderPage() {
  const [assets, warranties, tasks] = await Promise.all([
    getAssets(),
    getWarranties(),
    getMaintenanceTasks(),
  ]);

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Reminders"
          title="Add reminder"
          description="Create a due-date record for the household without scheduling a notification."
          action={<BackLinkButton href="/maintenance/reminders">Back to reminders</BackLinkButton>}
        />
        <ReminderForm
          fields={getReminderFields({
            assets: assets.data,
            warranties: warranties.data,
            tasks: tasks.data,
          })}
          action={createReminderAction}
          databaseConfigured={isPreviewDatabaseEnabled()}
        />
      </section>
    </AppShell>
  );
}
