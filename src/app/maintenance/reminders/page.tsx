import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { EmptyState } from "@/components/empty-state";
import { ListSearch } from "@/components/list-search";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Badge } from "@/components/ui/badge";
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
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const query = getQueryParam((await searchParams).q);
  const reminders = await getReminders();
  const visibleReminders = reminders.data.filter((reminder) =>
    matchesQuery(query, [
      reminder.title,
      reminder.dueAt,
      reminder.status,
      getDisplayLabel(reminder.status),
      reminder.assetName,
      reminder.warrantyName,
      reminder.taskTitle,
      reminder.notes,
    ]),
  );
  const pendingCount = reminders.data.filter((reminder) => reminder.status === "PENDING").length;

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title="Reminders"
          description="Review due dates and linked household records. Notification delivery is not connected."
          action={<BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>}
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
        <ListSearch
          action="/maintenance/reminders"
          defaultValue={query}
          label="Search reminders"
          placeholder="Search reminders or linked records"
          resultCount={visibleReminders.length}
          resultNoun="reminder"
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
            title={query ? "No reminders match this search" : "No reminders yet"}
            description={
              query
                ? "Try a reminder title, status or linked record."
                : "Reminder creation and notification delivery are not enabled in this phase."
            }
            action={
              query ? <BackLinkButton href="/maintenance/reminders">Clear search</BackLinkButton> : undefined
            }
          />
        )}
      </section>
    </AppShell>
  );
}
