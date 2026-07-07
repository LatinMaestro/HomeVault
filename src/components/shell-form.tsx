"use client";

import { useState } from "react";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
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
            <Button
              type="button"
              onClick={() => setMessage("Saving will be enabled in a later phase.")}
            >
              Save
            </Button>
            <p className="text-sm text-muted-foreground">
              These fields are a non-saving Phase 1C shell.
            </p>
          </div>

          {message ? (
            <div className="rounded-md border bg-secondary px-3 py-2 text-sm text-secondary-foreground">
              {message}
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
