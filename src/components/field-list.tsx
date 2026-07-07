export function FieldList({
  fields,
}: {
  fields: Array<{ label: string; value?: string | number | null }>;
}) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className="space-y-1">
          <dt className="text-xs font-medium uppercase text-muted-foreground">{field.label}</dt>
          <dd className="text-sm text-foreground">{field.value || "Not recorded"}</dd>
        </div>
      ))}
    </dl>
  );
}
