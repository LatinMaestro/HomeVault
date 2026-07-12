import type { ShellField } from "@/components/shell-form";
import type { ServiceProviderDetail } from "@/lib/sample-data";

export const serviceProviderFields: ShellField[] = [
  {
    label: "Provider name",
    name: "name",
    placeholder: "Brisbane Home Electrical",
    helperText: "Use the business or person name your household recognises.",
    recommended: true,
  },
  {
    label: "Trade or service",
    name: "trade",
    placeholder: "Electrician",
    helperText: "For example electrician, plumber or appliance repair.",
  },
  {
    label: "Phone",
    name: "phone",
    placeholder: "07 3000 0000",
    helperText: "Add the contact number you would normally call.",
  },
  {
    label: "Email",
    name: "email",
    placeholder: "hello@example.com.au",
    helperText: "Optional contact email.",
  },
  {
    label: "Website",
    name: "website",
    placeholder: "https://example.com.au",
    helperText: "Include http:// or https://.",
  },
  {
    label: "Notes",
    name: "notes",
    placeholder: "Availability, service area or household notes",
    helperText: "Keep practical notes only. Avoid sensitive payment information.",
    multiline: true,
  },
];

export function getServiceProviderEditFields(
  provider: ServiceProviderDetail | null,
): ShellField[] {
  return serviceProviderFields.map((field) => {
    const value = provider?.[field.name as keyof ServiceProviderDetail];
    return {
      ...field,
      defaultValue: typeof value === "string" ? value : "",
    };
  });
}
