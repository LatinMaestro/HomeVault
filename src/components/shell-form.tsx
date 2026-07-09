"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, SaveOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type ShellField = {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  multiline?: boolean;
  recommended?: boolean;
  helperText?: string;
};

export function ShellForm({
  title,
  description,
  fields,
}: {
  title: string;
  description: string;
  fields: ShellField[];
}) {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const missingRecommendedFields = fields
      .filter((field) => field.recommended)
      .filter((field) => !String(formData.get(field.name) ?? "").trim())
      .map((field) => field.label.toLowerCase());

    if (missingRecommendedFields.length > 0) {
      setMessage(
        `Preview check: add ${missingRecommendedFields.join(" and ")} before future saving is enabled. Nothing has been changed.`,
      );
      return;
    }

    setMessage("Preview check complete. Saving will be enabled in a later phase. Nothing has been changed.");
  }

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
              <Eye className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Preview only</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  You can review field layout and wording before real saving is approved.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-md border bg-background p-3">
            <div className="flex items-start gap-3">
              <SaveOff className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No changes saved</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Save shows a message only. It does not create, edit or delete records.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {fields.map((field) => {
            const helperId = field.helperText ? `${field.name}-helper` : undefined;

            return (
              <label key={field.name} className="block space-y-2 text-sm font-medium">
                <span className="flex flex-wrap items-center gap-2">
                  <span>{field.label}</span>
                  {field.recommended ? (
                    <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      Recommended
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
            <Button type="submit">Save</Button>
            <p className="text-sm text-muted-foreground">
              This preview form checks recommended fields but does not save yet.
            </p>
          </div>

          {message ? (
            <div
              className="rounded-md border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
