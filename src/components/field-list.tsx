import { cn } from "@/lib/utils";

export function FieldList({
  fields,
}: {
  fields: Array<{ label: string; value?: string | number | null }>;
}) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const hasValue = field.value !== null && field.value !== undefined && field.value !== "";

        return (
          <div key={field.label} className="space-y-1 rounded-md border bg-background p-3">
            <dt className="text-xs font-medium uppercase text-muted-foreground">{field.label}</dt>
            <dd className={cn("text-sm", hasValue ? "text-foreground" : "text-muted-foreground")}>
              {hasValue ? field.value : "Not recorded yet"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
