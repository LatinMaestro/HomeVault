import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMaintenanceTask } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function MaintenanceTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = await getMaintenanceTask(taskId);

  if (!task.data) {
    return (
      <AppShell activeSection="Maintenance">
        <section className="space-y-5">
          <PageHeader
            eyebrow="Maintenance"
            title="Task not found"
            description="This task was not found in the current HomeVault data source."
          />
          <DataSourceNote source={task.source} />
          <EmptyState
            title="No matching maintenance task"
            description="The task may have been removed, may not exist in the configured database, or may not be part of the built-in sample data."
            action={
              <Button asChild variant="outline">
                <Link href="/maintenance">Back to maintenance</Link>
              </Button>
            }
          />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title={task.data.title}
          description={task.data.description || "Read-only maintenance task detail."}
        />
        <DataSourceNote source={task.source} />

        <Card>
          <CardHeader>
            <CardTitle>Task details</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Frequency", value: task.data.frequency },
                { label: "Next due", value: task.data.nextDueDate },
                { label: "Status", value: task.data.status },
                { label: "Asset", value: task.data.assetName },
                { label: "Service provider", value: task.data.serviceProviderName },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion history</CardTitle>
            <CardDescription>Read-only service records linked to this task.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {task.data.completions.length ? (
              task.data.completions.map((completion) => (
                <div key={completion.id} className="rounded-md border bg-background p-3">
                  <p className="font-medium text-foreground">{completion.completedAt}</p>
                  <p className="text-muted-foreground">
                    {completion.completedBy || "Person not recorded yet"}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    {completion.notes || "Notes not recorded yet"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No completion records yet.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
