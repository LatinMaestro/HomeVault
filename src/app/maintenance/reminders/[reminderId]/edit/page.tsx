import { isPreviewDatabaseEnabled } from "@/lib/db";

import type { Metadata } from "next";

import { updateReminderAction } from "@/app/maintenance/reminders/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { ReminderForm } from "@/components/reminder-form";
import {
  getAssets,
  getMaintenanceTasks,
  getReminder,
  getWarranties,
} from "@/lib/home-data";
import { getReminderFields } from "@/lib/reminder-fields";

export const metadata: Metadata = {
  title: "Edit Reminder",
  description: "Edit reminder metadata without notification delivery.",
};

export const dynamic = "force-dynamic";

export default async function EditReminderPage({
  params,
}: {
  params: Promise<{ reminderId: string }>;
}) {
  const { reminderId } = await params;
  const [reminder, assets, warranties, tasks] = await Promise.all([
    getReminder(reminderId),
    getAssets(),
    getWarranties(),
    getMaintenanceTasks(),
  ]);
  const updateAction = updateReminderAction.bind(null, reminderId);

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Reminders"
          title={`Edit ${reminder.data?.title ?? "reminder"}`}
          description="Update due-date, status and linked-record metadata without sending notifications."
          action={
            <BackLinkButton href={`/maintenance/reminders/${reminderId}`}>
              Back to reminder
            </BackLinkButton>
          }
        />
        <ReminderForm
          fields={getReminderFields({
            reminder: reminder.data,
            assets: assets.data,
            warranties: warranties.data,
            tasks: tasks.data,
          })}
          action={updateAction}
          databaseConfigured={isPreviewDatabaseEnabled()}
        />
      </section>
    </AppShell>
  );
}
