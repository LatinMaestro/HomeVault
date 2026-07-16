"use client";

import { useActionState } from "react";
import { BellOff, CheckCircle2, Database, Save, TriangleAlert } from "lucide-react";

import type { ReminderActionState } from "@/app/maintenance/reminders/actions";
import { PersistentFormFields } from "@/components/persistent-form-fields";
import type { ShellField } from "@/components/shell-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ReminderActionState = { status: "idle", message: "" };

export function ReminderForm({
  fields,
  action,
  databaseConfigured,
}: {
  fields: ShellField[];
  action: (
    state: ReminderActionState,
    formData: FormData,
  ) => Promise<ReminderActionState>;
  databaseConfigured: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isSuccess = state.status === "success";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminder details</CardTitle>
        <CardDescription>
          Save reminder metadata and links without scheduling a delivery channel.
        </CardDescription>
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
                    ? "Reminder metadata can save to the configured database."
                    : "Saving will show a safe message until the database is configured."}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-md border bg-background p-3">
            <div className="flex items-start gap-3">
              <BellOff className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Delivery is off</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Saving does not send or schedule email, push, SMS or in-app notifications.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-4" action={formAction}>
          <PersistentFormFields fields={fields} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {isPending ? "Saving..." : "Save reminder"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Deletes and automated delivery remain unavailable.
            </p>
          </div>
          {state.message ? (
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
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
