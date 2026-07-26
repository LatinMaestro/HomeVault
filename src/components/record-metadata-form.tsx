"use client";

import { useActionState } from "react";
import { CheckCircle2, Database, FileText, FileUp, Save, TriangleAlert } from "lucide-react";

import type { RecordActionState } from "@/app/receipts/actions";
import { PersistentFormFields } from "@/components/persistent-form-fields";
import type { ShellField } from "@/components/shell-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: RecordActionState = {
  status: "idle",
  message: "",
};

export function RecordMetadataForm({
  recordType,
  title,
  description,
  fields,
  action,
  databaseConfigured,
  allowAttachment = false,
  attachmentEnabled = false,
}: {
  recordType: "receipt" | "document";
  title: string;
  description: string;
  fields: ShellField[];
  action: (state: RecordActionState, formData: FormData) => Promise<RecordActionState>;
  databaseConfigured: boolean;
  allowAttachment?: boolean;
  attachmentEnabled?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isSuccess = state.status === "success";
  const label = recordType === "receipt" ? "receipt" : "document";
  const canSelectAttachment = allowAttachment && attachmentEnabled;

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
                    ? `${label[0].toUpperCase() + label.slice(1)} metadata can save to the configured database.`
                    : "Saving will show a safe message until database persistence is configured."}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-md border bg-background p-3">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {allowAttachment ? "Private file" : "Metadata only"}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {allowAttachment
                    ? canSelectAttachment
                      ? "Optionally choose a PDF, JPEG or PNG below. The file and details save together."
                      : "Private file storage is unavailable. You can still save the record details."
                    : "This form updates record details only. Existing private files are unchanged."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-4" action={formAction}>
          <PersistentFormFields fields={fields} />

          {allowAttachment ? (
            <div className="space-y-2 rounded-md border bg-background p-4">
              <label htmlFor="attachment" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileUp className="h-4 w-4 text-primary" aria-hidden="true" />
                Add file <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="attachment"
                name="attachment"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                disabled={!canSelectAttachment || isPending}
                className="block min-h-11 w-full rounded-md border bg-card px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="text-sm text-muted-foreground">
                PDF, JPEG or PNG up to 4 MB.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {isPending ? "Saving..." : `Save ${label}`}
            </Button>
            <p className="text-sm text-muted-foreground">
              {allowAttachment
                ? "The record saves with the selected private file."
                : "Saving changes the record details only."}
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
