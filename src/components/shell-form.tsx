"use client";

import { FormEvent, useState } from "react";

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
      <CardContent>
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
