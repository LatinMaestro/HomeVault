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
    setMessage("Saving will be enabled in a later phase. Nothing has been changed.");
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
          {fields.map((field) => (
            <label key={field.name} className="block space-y-2 text-sm font-medium">
              <span>{field.label}</span>
              {field.multiline ? (
                <Textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  defaultValue={field.defaultValue}
                  rows={4}
                />
              ) : (
                <Input
                  name={field.name}
                  placeholder={field.placeholder}
                  defaultValue={field.defaultValue}
                />
              )}
            </label>
          ))}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit">Save</Button>
            <p className="text-sm text-muted-foreground">
              This preview form does not save yet.
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
