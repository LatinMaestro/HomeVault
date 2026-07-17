import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CalendarClock, CalendarDays, Contact, LibraryBig, Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { EmptyState } from "@/components/empty-state";
import { MaintenanceFilters } from "@/components/maintenance-filters";
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
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    due?: string | string[];
    asset?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = getQueryParam(params.q);
  const status = getQueryParam(params.status);
  const due = getQueryParam(params.due);
  const asset = getQueryParam(params.asset);
  const tasks = await getMaintenanceTasks();
  const visibleTasks = tasks.data.filter(
    (task) =>
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
      ]) &&
      (!status || task.status === status) &&
      (!due || getDateStatus(task.nextDueDateInput, "maintenance").tone === due) &&
      (!asset || (asset === "unassigned" ? !task.assetId : task.assetId === asset)),
  );
  const statusOptions = Array.from(new Set(tasks.data.map((task) => task.status)))
    .map((value) => ({ value, label: getDisplayLabel(value) ?? value }))
    .sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const assetOptions = Array.from(
    new Map(
      tasks.data
        .filter((task) => task.assetId && task.assetName)
        .map((task) => [task.assetId as string, task.assetName as string]),
    ),
    ([value, label]) => ({ value, label }),
  ).sort((a, b) => a.label.localeCompare(b.label, "en-AU"));
  const hasFilters = Boolean(query || status || due || asset);

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title="Track recurring home upkeep before it becomes stressful."
          description="Review schedules, record completed work and keep household dates together."
          action={
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild variant="outline">
                <Link href="/calendar">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Calendar
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/maintenance/reminders">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                  Reminders
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/maintenance/templates">
                  <LibraryBig className="h-4 w-4" aria-hidden="true" />
                  Templates
                </Link>
              </Button>
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
              detail: "Task changes and completion history can save with controlled preview access. Recurring dates advance automatically; notification delivery remains off.",
            },
            {
              label: "Data",
              value: tasks.source === "database" ? "Database" : "Sample",
              detail: "Screens fall back gracefully when a database is unavailable.",
            },
          ]}
        />

        <MaintenanceFilters
          query={query}
          status={status}
          due={due}
          asset={asset}
          statusOptions={statusOptions}
          assetOptions={assetOptions}
          resultCount={visibleTasks.length}
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
            title={hasFilters ? "No matching tasks" : "No maintenance tasks yet"}
            description={
              hasFilters
                ? "Try another search or filter combination, or clear the current filters."
                : "Add a maintenance task when database saving is configured, or keep reviewing the built-in sample flow when a database is unavailable."
            }
            action={
              <Button asChild>
                <Link href={hasFilters ? "/maintenance" : "/maintenance/new"}>
                  {hasFilters ? "Clear filters" : "Add first task"}
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </AppShell>
  );
}
