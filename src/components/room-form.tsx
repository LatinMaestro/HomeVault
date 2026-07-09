"use client";

import { useActionState } from "react";
import { CheckCircle2, Database, Save, TriangleAlert } from "lucide-react";

import type { RoomActionState } from "@/app/vault/rooms/actions";
import type { ShellField } from "@/components/shell-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: RoomActionState = {
  status: "idle",
  message: "",
};

export function RoomForm({
  title,
  description,
  fields,
  action,
  databaseConfigured,
}: {
  title: string;
  description: string;
  fields: ShellField[];
  action: (state: RoomActionState, formData: FormData) => Promise<RoomActionState>;
  databaseConfigured: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isSuccess = state.status === "success";

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
                    ? "Room changes can save to the configured database."
                    : "Saving will show a safe message until DATABASE_URL is configured."}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-md border bg-background p-3">
            <div className="flex items-start gap-3">
              <Save className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Rooms only</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  This phase saves room create/edit changes only. Deletes and asset saving are still off.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-4" action={formAction}>
          {fields.map((field) => {
            const helperId = field.helperText ? `${field.name}-helper` : undefined;

            return (
              <label key={field.name} className="block space-y-2 text-sm font-medium">
                <span className="flex flex-wrap items-center gap-2">
                  <span>{field.label}</span>
                  {field.recommended ? (
                    <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      Required
                    </span>
                  ) : null}
                </span>
                {field.multiline ? (
                  <Textarea
                    name={field.name}
                    placeholder={field.placeholder}
                    defaultValue={field.defaultValue}
                    rows={4}
                    aria-describedby={helperId}
                  />
                ) : (
                  <Input
                    name={field.name}
                    placeholder={field.placeholder}
                    defaultValue={field.defaultValue}
                    aria-describedby={helperId}
                  />
                )}
                {field.helperText ? (
                  <span id={helperId} className="block text-sm font-normal leading-6 text-muted-foreground">
                    {field.helperText}
                  </span>
                ) : null}
              </label>
            );
          })}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save room"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Saving is limited to rooms in this phase.
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
