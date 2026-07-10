"use client";

import { useActionState } from "react";
import { CheckCircle2, ClipboardCheck, Database, Save, TriangleAlert } from "lucide-react";

import type { MaintenanceActionState } from "@/app/maintenance/actions";
import { PersistentFormFields } from "@/components/persistent-form-fields";
import type { ShellField } from "@/components/shell-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: MaintenanceActionState = {
  status: "idle",
  message: "",
};

function ActionMessage({ state }: { state: MaintenanceActionState }) {
  if (!state.message) return null;

  const isSuccess = state.status === "success";

  return (
    <div
      className="flex items-start gap-3 rounded-md border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
      role="status"
      aria-live="polite"
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      ) : (
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      )}
      <span>{state.message}</span>
    </div>
  );
}

export function MaintenanceTaskForm({
  title,
  description,
  fields,
  action,
  databaseConfigured,
}: {
  title: string;
  description: string;
  fields: ShellField[];
  action: (state: MaintenanceActionState, formData: FormData) => Promise<MaintenanceActionState>;
  databaseConfigured: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border bg-background p-3">
            <div className="flex items-start gap-3">
              <Database className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {databaseConfigured ? "Database saving" : "Database needed"}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {databaseConfigured
                    ? "Maintenance task changes can save to the configured database."
                    : "Saving will show a safe message until DATABASE_URL is configured."}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-md border bg-background p-3">
            <div className="flex items-start gap-3">
              <Save className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Maintenance only</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  This phase saves maintenance tasks and completion records only. Deletes and reminders are still off.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-4" action={formAction}>
          <PersistentFormFields fields={fields} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save task"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Saving is limited to maintenance task details in this phase.
            </p>
          </div>

          <ActionMessage state={state} />
        </form>
      </CardContent>
    </Card>
  );
}

export function MaintenanceCompletionForm({
  action,
  databaseConfigured,
}: {
  action: (state: MaintenanceActionState, formData: FormData) => Promise<MaintenanceActionState>;
  databaseConfigured: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record completion</CardTitle>
        <CardDescription>
          Add a simple service note when this task has been completed. This does not create reminders or automate recurrence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-md border bg-background p-3">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {databaseConfigured ? "Completion saving" : "Database needed"}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {databaseConfigured
                  ? "Completion records are added to task history without deleting or rewriting older records."
                  : "Completion saving will show a safe message until DATABASE_URL is configured."}
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-4" action={formAction}>
          <label className="block space-y-2 text-sm font-medium">
            <span>Completed date</span>
            <Input name="completedAt" type="date" />
            <span className="block text-sm font-normal leading-6 text-muted-foreground">
              Optional. Leave blank to use today when the database records the completion.
            </span>
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Completed by</span>
            <Input name="completedBy" placeholder="Sam" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Notes</span>
            <Textarea name="notes" placeholder="What was checked, cleaned or serviced?" rows={4} />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Recording..." : "Record completion"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Completion records are additive only in this phase.
            </p>
          </div>

          <ActionMessage state={state} />
        </form>
      </CardContent>
    </Card>
  );
}
