import type { ShellField } from "@/components/shell-form";

export type MaintenanceTemplate = {
  id: string;
  title: string;
  description: string;
  frequency: "MONTHLY" | "QUARTERLY" | "SIX_MONTHLY" | "YEARLY";
  category: "Comfort" | "Safety" | "Exterior" | "Water" | "Garden";
  guidance: string;
};

export const maintenanceTemplates: MaintenanceTemplate[] = [
  {
    id: "air-conditioner-filters",
    title: "Clean air conditioner filters",
    description: "Remove dust, wash reusable filters where suitable and let them dry fully before refitting.",
    frequency: "QUARTERLY",
    category: "Comfort",
    guidance: "Check the appliance manual and shorten the interval during heavy use or dusty conditions.",
  },
  {
    id: "smoke-alarm-check",
    title: "Check smoke alarms",
    description: "Use the test button, check the indicator and clean around the alarm without opening it.",
    frequency: "MONTHLY",
    category: "Safety",
    guidance: "Follow Queensland Fire Department and manufacturer guidance for testing, batteries and replacement dates.",
  },
  {
    id: "gutters-and-downpipes",
    title: "Inspect gutters and downpipes",
    description: "Look for leaf build-up, blockages, loose fittings and signs that water is not draining freely.",
    frequency: "SIX_MONTHLY",
    category: "Exterior",
    guidance: "Use a qualified provider where height, roof access or electrical hazards make the work unsafe.",
  },
  {
    id: "hot-water-system",
    title: "Inspect hot water system",
    description: "Check the visible unit and surrounding area for leaks, corrosion, unusual noise or warning indicators.",
    frequency: "SIX_MONTHLY",
    category: "Water",
    guidance: "Do not operate valves or open covers unless the manufacturer instructions say it is safe.",
  },
  {
    id: "termite-inspection",
    title: "Arrange termite inspection",
    description: "Book a licensed timber pest inspection and keep the report with the home records.",
    frequency: "YEARLY",
    category: "Safety",
    guidance: "Inspection frequency depends on the property, construction and local risk; follow professional advice.",
  },
  {
    id: "garage-door",
    title: "Check garage door operation",
    description: "Observe opening, closing, balance, unusual movement and the safety-reverse function.",
    frequency: "SIX_MONTHLY",
    category: "Safety",
    guidance: "Keep clear of moving parts and use a qualified technician for springs, cables or unsafe operation.",
  },
  {
    id: "rainwater-system",
    title: "Inspect rainwater system",
    description: "Check visible screens, first-flush devices, overflows, pumps and pipework for damage or blockage.",
    frequency: "QUARTERLY",
    category: "Water",
    guidance: "Follow local health guidance and the system supplier's instructions, especially for drinking-water use.",
  },
  {
    id: "garden-equipment",
    title: "Service garden equipment",
    description: "Inspect guards, fasteners, batteries or fuel system, clean the equipment and follow its service schedule.",
    frequency: "SIX_MONTHLY",
    category: "Garden",
    guidance: "Disconnect power or remove the battery before maintenance and follow the equipment manual.",
  },
];

export function getMaintenanceTemplate(id?: string) {
  return maintenanceTemplates.find((template) => template.id === id);
}

export function applyMaintenanceTemplate(
  fields: ShellField[],
  template?: MaintenanceTemplate,
): ShellField[] {
  if (!template) return fields;

  return fields.map((field) => ({
    ...field,
    defaultValue:
      field.name === "title"
        ? template.title
        : field.name === "description"
          ? template.description
          : field.name === "frequency"
            ? template.frequency
            : field.name === "status"
              ? "ACTIVE"
              : field.defaultValue,
  }));
}
