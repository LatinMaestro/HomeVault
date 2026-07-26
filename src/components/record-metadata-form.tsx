"use client";

import { useActionState } from "react";
import { CheckCircle2, Database, FileText, Save, TriangleAlert } from "lucide-react";

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
  documentAttachmentNext = false,
}: {
  recordType: "receipt" | "document";
  title: string;
  description: string;
  fields: ShellField[];
  action: (state: RecordActionState, formData: FormData) => Promise<RecordActionState>;
  databaseConfigured: boolean;
  documentAttachmentNext?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isSuccess = state.status === "success";
  const label = recordType === "receipt" ? "receipt" : "document";
  const hasAttachmentStep = recordType === "document" && documentAttachmentNext;

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
                  {hasAttachmentStep ? "Attachment is next" : "Metadata only"}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {hasAttachmentStep
                    ? "Save these details first. HomeVault will then open the document so you can choose and privately upload a PDF, JPEG or PNG."
                    : "This receipt saves as metadata only. Scanning and email forwarding remain off."}
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
              {isPending ? "Saving..." : `Save ${label}`}
            </Button>
            <p className="text-sm text-muted-foreground">
              {hasAttachmentStep
                ? "Step 1 of 2: save details, then add the private file."
                : "Saving is limited to receipt metadata."}
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
