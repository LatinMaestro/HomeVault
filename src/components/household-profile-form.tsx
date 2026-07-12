"use client";

import { useActionState } from "react";
import { CheckCircle2, Database, Home, Save, TriangleAlert } from "lucide-react";

import type { HouseholdProfileActionState } from "@/app/settings/actions";
import { PersistentFormFields } from "@/components/persistent-form-fields";
import type { ShellField } from "@/components/shell-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: HouseholdProfileActionState = { status: "idle", message: "" };

export function HouseholdProfileForm({
  fields,
  action,
  databaseConfigured,
}: {
  fields: ShellField[];
  action: (
    state: HouseholdProfileActionState,
    formData: FormData,
  ) => Promise<HouseholdProfileActionState>;
  databaseConfigured: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isSuccess = state.status === "success";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Household profile</CardTitle>
        <CardDescription>
          Keep the home name and Australian address metadata current.
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
                    ? "Household details can save to the configured database."
                    : "Saving will show a safe message until the database is configured."}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-md border bg-background p-3">
            <div className="flex items-start gap-3">
              <Home className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Single-home mode</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Multi-home switching, members and roles remain unavailable until authentication is approved.
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
              {isPending ? "Saving..." : "Save household"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Country remains Australia for the current MVP.
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
