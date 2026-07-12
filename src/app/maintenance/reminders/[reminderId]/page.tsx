import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDateStatus } from "@/lib/date-status";
import { getDisplayLabel } from "@/lib/display-labels";
import { getReminder } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Reminder Detail",
  description: "Review a HomeVault reminder and its linked records.",
};

export const dynamic = "force-dynamic";

export default async function ReminderDetailPage({
  params,
}: {
  params: Promise<{ reminderId: string }>;
}) {
  const { reminderId } = await params;
  const reminder = await getReminder(reminderId);

  if (!reminder.data) {
    return (
      <AppShell activeSection="Maintenance">
        <section className="space-y-5">
          <PageHeader
            eyebrow="Reminders"
            title="Reminder not found"
            description="This reminder was not found in the current HomeVault data source."
          />
          <DataSourceNote source={reminder.source} />
          <EmptyState
            title="No matching reminder"
            description="The reminder may not exist in the configured database or built-in sample data."
            action={<BackLinkButton href="/maintenance/reminders">Back to reminders</BackLinkButton>}
          />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Reminder"
          title={reminder.data.title}
          description="Reminder metadata only. HomeVault is not sending notifications."
          action={<BackLinkButton href="/maintenance/reminders">Back to reminders</BackLinkButton>}
        />
        <DataSourceNote source={reminder.source} />

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Reminder details</CardTitle>
              <CardDescription>Due date, status and household context.</CardDescription>
            </div>
            <DateStatusBadge status={getDateStatus(reminder.data.dueAtInput, "reminder")} />
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Due", value: reminder.data.dueAt },
                { label: "Status", value: getDisplayLabel(reminder.data.status) },
                { label: "Asset", value: reminder.data.assetName },
                { label: "Warranty", value: reminder.data.warrantyName },
                { label: "Maintenance task", value: reminder.data.taskTitle },
                { label: "Notes", value: reminder.data.notes },
              ]}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row">
          {reminder.data.assetId ? (
            <Button asChild variant="outline">
              <Link href={`/vault/assets/${reminder.data.assetId}`}>View asset</Link>
            </Button>
          ) : null}
          {reminder.data.warrantyId ? (
            <Button asChild variant="outline">
              <Link href={`/warranties/${reminder.data.warrantyId}`}>View warranty</Link>
            </Button>
          ) : null}
          {reminder.data.taskId ? (
            <Button asChild variant="outline">
              <Link href={`/maintenance/${reminder.data.taskId}`}>View maintenance task</Link>
            </Button>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
