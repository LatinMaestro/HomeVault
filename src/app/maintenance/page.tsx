import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMaintenanceTasks } from "@/lib/home-data";

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
      </section>
    </AppShell>
  );
}

