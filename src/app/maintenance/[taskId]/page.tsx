import { isPreviewDatabaseEnabled } from "@/lib/db";

import type { Metadata } from "next";
import Link from "next/link";

import { completeMaintenanceTaskAction } from "@/app/maintenance/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { DateStatusBadge } from "@/components/date-status-badge";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { MaintenanceCompletionForm } from "@/components/maintenance-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDateStatus } from "@/lib/date-status";
import { getDisplayLabel, getMaintenanceFrequencyLabel } from "@/lib/display-labels";
import { getMaintenanceTask } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Maintenance Detail",
  description: "Review a HomeVault maintenance task record.",
};

export const dynamic = "force-dynamic";

export default async function MaintenanceTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const task = await getMaintenanceTask(taskId);
  const completionAction = completeMaintenanceTaskAction.bind(null, taskId);

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
            action={<BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>}
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
          description={task.data.description || "Maintenance task detail with database-backed editing when persistence is configured."}
          action={<BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>}
        />
        <DataSourceNote source={task.source} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="secondary">
            <Link href={`/maintenance/${task.data.id}/edit`}>Edit task</Link>
          </Button>
          {task.data.assetId ? (
            <Button asChild variant="outline">
              <Link href={`/vault/assets/${task.data.assetId}`}>View linked asset</Link>
            </Button>
          ) : null}
          {task.data.serviceProviderId ? (
            <Button asChild variant="outline">
              <Link href={`/maintenance/providers/${task.data.serviceProviderId}`}>
                View service provider
              </Link>
            </Button>
          ) : null}
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Task details</CardTitle>
            <DateStatusBadge
              status={getDateStatus(task.data.nextDueDateInput, "maintenance")}
            />
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Frequency", value: getMaintenanceFrequencyLabel(task.data.frequency, task.data.customIntervalDays) },
                { label: "Next due", value: task.data.nextDueDate },
                { label: "Status", value: getDisplayLabel(task.data.status) },
                { label: "Asset", value: task.data.assetName },
                { label: "Service provider", value: task.data.serviceProviderName },
              ]}
            />
          </CardContent>
        </Card>

        <MaintenanceCompletionForm
          action={completionAction}
          databaseConfigured={isPreviewDatabaseEnabled()}
          taskStatus={task.data.status}
        />

        <Card>
          <CardHeader>
            <CardTitle>Completion history</CardTitle>
            <CardDescription>Service records linked to this task.</CardDescription>
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
