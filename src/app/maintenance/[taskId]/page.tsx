import { isCurrentHouseholdWritable } from "@/lib/household-access";

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
import { NativeShareButton } from "@/components/native-share-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
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

  const taskData = task.data;
  return (
    <AppShell activeSection="Maintenance">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Maintenance"
          title={taskData.title}
          description={taskData.description || "Maintenance task detail with database-backed editing when persistence is configured."}
          action={<BackLinkButton href="/maintenance">Back to maintenance</BackLinkButton>}
        />
        <DataSourceNote source={task.source} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="secondary">
            <Link href={`/maintenance/${taskData.id}/edit`}>Edit task</Link>
          </Button>
          {taskData.assetId ? (
            <Button asChild variant="outline">
              <Link href={`/vault/assets/${taskData.assetId}`}>View linked asset</Link>
            </Button>
          ) : null}
          {taskData.serviceProviderId ? (
            <Button asChild variant="outline">
              <Link href={`/maintenance/providers/${taskData.serviceProviderId}`}>
                View service provider
              </Link>
            </Button>
          ) : null}
          <NativeShareButton
            title={taskData.title}
            path={`/maintenance/${taskData.id}`}
            description="View this household maintenance task in HomeVault."
          />
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Task details</CardTitle>
            <DateStatusBadge
              status={getDateStatus(taskData.nextDueDateInput, "maintenance")}
            />
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Frequency", value: getMaintenanceFrequencyLabel(taskData.frequency, taskData.customIntervalDays) },
                { label: "Next due", value: taskData.nextDueDate },
                { label: "Status", value: getDisplayLabel(taskData.status) },
                { label: "Asset", value: taskData.assetName },
                { label: "Service provider", value: taskData.serviceProviderName },
              ]}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Related documents</CardTitle>
              <CardDescription>Document metadata linked to this task.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {taskData.documents.length > 0 ? (
                taskData.documents.map((document) => (
                  <Link
                    key={document.id}
                    href={`/receipts/${document.id}`}
                    className="block min-h-11 rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <span className="block font-medium text-foreground">{document.title}</span>
                    <span className="block text-muted-foreground">
                      {getDisplayLabel(document.type)}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No document metadata is linked to this task yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up reminders</CardTitle>
              <CardDescription>Recorded dates linked to this task.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {taskData.reminders.length > 0 ? (
                taskData.reminders.map((reminder) => (
                  <Link
                    key={reminder.id}
                    href={`/maintenance/reminders/${reminder.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <span>
                      <span className="block font-medium text-foreground">{reminder.title}</span>
                      <span className="block text-muted-foreground">Due {reminder.dueAt}</span>
                    </span>
                    <Badge variant="secondary">{getDisplayLabel(reminder.status)}</Badge>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No reminders are linked to this task yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <MaintenanceCompletionForm
          action={completionAction}
          databaseConfigured={await isCurrentHouseholdWritable()}
          taskStatus={taskData.status}
        />

        <Card>
          <CardHeader>
            <CardTitle>Completion history</CardTitle>
            <CardDescription>Service records linked to this task.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {taskData.completions.length ? (
              taskData.completions.map((completion) => (
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
