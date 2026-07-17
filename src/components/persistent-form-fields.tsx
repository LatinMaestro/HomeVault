import type { ShellField } from "@/components/shell-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PersistentFormFields({
  fields,
  requiredLabel = "Required",
}: {
  fields: ShellField[];
  requiredLabel?: string;
}) {
  return fields.map((field) => {
    const helperId = field.helperText ? `${field.name}-helper` : undefined;

    return (
      <label key={field.name} className="block space-y-2 text-sm font-medium">
        <span className="flex flex-wrap items-center gap-2">
          <span>{field.label}</span>
          {field.recommended ? (
            <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {requiredLabel}
            </span>
          ) : null}
        </span>
        {field.options ? (
          <select
            name={field.name}
            defaultValue={field.defaultValue}
            aria-describedby={helperId}
            required={field.recommended}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{field.emptyOptionLabel ?? "Choose an option"}</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.multiline ? (
          <Textarea
            name={field.name}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            rows={4}
            aria-describedby={helperId}
            required={field.recommended}
          />
        ) : (
          <Input
            name={field.name}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            aria-describedby={helperId}
            required={field.recommended}
            type={field.inputType ?? "text"}
            inputMode={field.inputType === "number" ? "decimal" : undefined}
            min={field.min}
            step={field.step}
          />
        )}
        {field.helperText ? (
          <span id={helperId} className="block text-sm font-normal leading-6 text-muted-foreground">
            {field.helperText}
          </span>
        ) : null}
      </label>
    );
  });
}
