import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { EmptyState } from "@/components/empty-state";
import { ReminderFilters } from "@/components/reminder-filters";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDateStatus } from "@/lib/date-status";
import { getDisplayLabel } from "@/lib/display-labels";
import { getReminders } from "@/lib/home-data";
import { getQueryParam, matchesQuery } from "@/lib/list-filter";

export const metadata: Metadata = {
  title: "Reminders",
  description: "Review household reminder metadata without notification delivery.",
};

export const dynamic = "force-dynamic";

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    due?: string | string[];
    link?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = getQueryParam(params.q);
  const status = getQueryParam(params.status);
  const due = getQueryParam(params.due);
  const link = getQueryParam(params.link);
  const reminders = await getReminders();
  const visibleReminders = reminders.data.filter(
    (reminder) =>
      matchesQuery(query, [
        reminder.title,
        reminder.dueAt,
        reminder.status,
        getDisplayLabel(reminder.status),
        reminder.assetName,
        reminder.warrantyName,
        reminder.taskTitle,
        reminder.notes,
      ]) &&
      (!status || reminder.status === status) &&
      (!due || getDateStatus(reminder.dueAtInput, "reminder").tone === due) &&
      (!link ||
        (link === "asset" && Boolean(reminder.assetId)) ||
        (link === "warranty" && Boolean(reminder.warrantyId)) ||
        (link === "task" && Boolean(reminder.taskId)) ||
        (link === "unassigned" &&
          !reminder.assetId &&
          !reminder.warrantyId &&
          !reminder.taskId)),
  );
  const statusOptions = Array.from(new Set(reminders.data.map((reminder) => reminder.status)))
    .map((value) => ({ value, label: getDisplayLabel(value) ?? value }))
    .sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const hasFilters = Boolean(query || status || due || link);
  const pendingCount = reminders.data.filter((reminder) => reminder.status === "PENDING").length;

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title="Reminders"
          description="Review due dates and linked household records. Notification delivery is not connected."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>
              <Button asChild>
                <Link href="/maintenance/reminders/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add reminder
                </Link>
              </Button>
            </div>
          }
        />
        <DataSourceNote source={reminders.source} />
        <ReviewSummary
          items={[
            {
              label: "Reminders",
              value: `${reminders.data.length}`,
              detail: "Reminder records available for this home.",
            },
            {
              label: "Pending",
              value: `${pendingCount}`,
              detail: "Open reminders that have not been marked done or cancelled.",
            },
            {
              label: "Delivery",
              value: "Off",
              detail: "No email, push or SMS notifications are sent.",
            },
          ]}
        />
        <ReminderFilters
          query={query}
          status={status}
          due={due}
          link={link}
          statusOptions={statusOptions}
          resultCount={visibleReminders.length}
        />

        {visibleReminders.length ? (
          <div className="grid gap-4">
            {visibleReminders.map((reminder) => (
              <Link key={reminder.id} href={`/maintenance/reminders/${reminder.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <CardTitle>{reminder.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <DateStatusBadge status={getDateStatus(reminder.dueAtInput, "reminder")} />
                        <Badge variant="secondary">{getDisplayLabel(reminder.status)}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>{reminder.dueAt}</span>
                    {reminder.assetName ? <span>{reminder.assetName}</span> : null}
                    {reminder.warrantyName ? <span>{reminder.warrantyName}</span> : null}
                    {reminder.taskTitle ? <span>{reminder.taskTitle}</span> : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={hasFilters ? "No reminders match these filters" : "No reminders yet"}
            description={
              hasFilters
                ? "Try another search or filter combination, or clear the current filters."
                : "Add reminder metadata for a household due date. Delivery remains switched off."
            }
            action={
              hasFilters ? (
                <BackLinkButton href="/maintenance/reminders">Clear filters</BackLinkButton>
              ) : (
                <Button asChild>
                  <Link href="/maintenance/reminders/new">Add reminder</Link>
                </Button>
              )
            }
          />
        )}
      </section>
    </AppShell>
  );
}
