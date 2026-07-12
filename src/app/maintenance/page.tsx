import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Contact, Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { EmptyState } from "@/components/empty-state";
import { ListSearch } from "@/components/list-search";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDateStatus } from "@/lib/date-status";
import { getDisplayLabel, getMaintenanceFrequencyLabel } from "@/lib/display-labels";
import { getMaintenanceTasks } from "@/lib/home-data";
import { getQueryParam, matchesQuery } from "@/lib/list-filter";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Review recurring home maintenance tasks and service records in HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const query = getQueryParam((await searchParams).q);
  const tasks = await getMaintenanceTasks();
  const visibleTasks = tasks.data.filter((task) =>
    matchesQuery(query, [
      task.title,
      task.description,
      task.frequency,
      task.customIntervalDays,
      getMaintenanceFrequencyLabel(task.frequency, task.customIntervalDays),
      task.nextDueDate,
      task.status,
      getDisplayLabel(task.status),
      task.assetName,
      task.serviceProviderName,
    ]),
  );

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title="Track recurring home upkeep before it becomes stressful."
          description="Review maintenance tasks, save task changes when a database is configured, and record simple completion notes."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/maintenance/providers">
                  <Contact className="h-4 w-4" aria-hidden="true" />
                  Providers
                </Link>
              </Button>
              <Button asChild>
                <Link href="/maintenance/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add task
                </Link>
              </Button>
            </div>
          }
        />
        <DataSourceNote source={tasks.source} />
        <ReviewSummary
          items={[
            {
              label: "Tasks",
              value: `${tasks.data.length}`,
              detail: tasks.data.length === 1 ? "Maintenance task available for review." : "Maintenance tasks available for review.",
            },
            {
              label: "Saving",
              value: "Tasks",
              detail: "Task create/edit and completion records can save when the database is configured. Deletes and reminders are still off.",
            },
            {
              label: "Data",
              value: tasks.source === "database" ? "Database" : "Sample",
              detail: "Screens fall back gracefully when a database is unavailable.",
            },
          ]}
        />

        <ListSearch
          action="/maintenance"
          defaultValue={query}
          label="Search maintenance tasks"
          placeholder="Search tasks, assets or providers"
          resultCount={visibleTasks.length}
          resultNoun="task"
        />

        {visibleTasks.length > 0 ? (
          <div className="grid gap-4">
            {visibleTasks.map((task) => (
              <Link key={task.id} href={`/maintenance/${task.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle>{task.title}</CardTitle>
                        <CardDescription>{task.description || "No description recorded"}</CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <DateStatusBadge
                          status={getDateStatus(task.nextDueDateInput, "maintenance")}
                        />
                        <Badge variant="secondary">{getDisplayLabel(task.status)}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" aria-hidden="true" />
                      {task.nextDueDate || "No due date"}
                    </span>
                    <span>{getMaintenanceFrequencyLabel(task.frequency, task.customIntervalDays)}</span>
                    {task.assetName ? <span>{task.assetName}</span> : null}
                    {task.serviceProviderName ? <span>{task.serviceProviderName}</span> : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={query ? "No matching tasks" : "No maintenance tasks yet"}
            description={
              query
                ? "Try another task, asset or frequency, or clear the current search."
                : "Add a maintenance task when database saving is configured, or keep reviewing the built-in sample flow when a database is unavailable."
            }
            action={
              <Button asChild>
                <Link href={query ? "/maintenance" : "/maintenance/new"}>
                  {query ? "Clear search" : "Add first task"}
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </AppShell>
  );
}
