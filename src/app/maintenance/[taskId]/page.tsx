import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
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
        <PageHeader
          eyebrow="Maintenance"
          title="Task not found"
          description="This task was not found in the database or sample data."
        />
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
            <CardDescription>Read-only records from seed or sample data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {task.data.completions.length ? (
              task.data.completions.map((completion) => (
                <div key={completion.id} className="rounded-md border p-3">
                  <p className="font-medium text-foreground">{completion.completedAt}</p>
                  <p>{completion.completedBy || "Unknown"} · {completion.notes || "No notes"}</p>
                </div>
              ))
            ) : (
              <p>No completions recorded.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
