import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMaintenanceTasks } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Review recurring home maintenance tasks and service records in HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const tasks = await getMaintenanceTasks();

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title="Track recurring home upkeep before it becomes stressful."
          description="Read-only task screens show upcoming maintenance and service history."
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
              label: "Mode",
              value: "Read-only",
              detail: "Task creation, completion and reminders are not enabled yet.",
            },
            {
              label: "Data",
              value: tasks.source === "database" ? "Database" : "Sample",
              detail: "Screens fall back gracefully when a database is unavailable.",
            },
          ]}
        />

        {tasks.data.length > 0 ? (
          <div className="grid gap-4">
            {tasks.data.map((task) => (
              <Link key={task.id} href={`/maintenance/${task.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle>{task.title}</CardTitle>
                        <CardDescription>{task.description || "No description recorded"}</CardDescription>
                      </div>
                      <Badge variant="secondary">{task.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" aria-hidden="true" />
                      {task.nextDueDate || "No due date"}
                    </span>
                    <span>{task.frequency}</span>
                    {task.assetName ? <span>{task.assetName}</span> : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No maintenance tasks yet"
            description="Maintenance tasks will show recurring jobs like filter cleaning, servicing and seasonal checks once task saving is approved."
          />
        )}
      </section>
    </AppShell>
  );
}
