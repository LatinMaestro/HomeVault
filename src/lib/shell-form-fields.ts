import type { ShellField } from "@/components/shell-form";

export const roomShellFields: ShellField[] = [
  {
    label: "Room name",
    name: "name",
    placeholder: "Kitchen",
    recommended: true,
    helperText: "Use the everyday name your household will recognise.",
  },
  {
    label: "Floor or zone",
    name: "floor",
    placeholder: "Ground floor",
    helperText: "Optional now, but useful later for filtering assets by area.",
  },
  {
    label: "Notes",
    name: "notes",
    placeholder: "Optional room notes",
    multiline: true,
    helperText: "Add reminders such as storage locations, renovation notes or access details.",
  },
];

export function getRoomEditShellFields(room?: {
  name?: string | null;
  floor?: string | null;
  notes?: string | null;
}): ShellField[] {
  return roomShellFields.map((field) => ({
    ...field,
    defaultValue:
      field.name === "name"
        ? room?.name ?? ""
        : field.name === "floor"
          ? room?.floor ?? ""
          : field.name === "notes"
            ? room?.notes ?? ""
            : field.defaultValue,
  }));
}

export const assetShellFields: ShellField[] = [
  {
    label: "Asset name",
    name: "name",
    placeholder: "French door fridge",
    recommended: true,
    helperText: "Use a plain name that will still make sense when searching later.",
  },
  {
    label: "Brand",
    name: "brand",
    placeholder: "Fisher & Paykel",
    helperText: "Helpful for warranty claims and service calls.",
  },
  {
    label: "Model",
    name: "model",
    placeholder: "RF605QDUVX1",
    helperText: "Add the model number when it is easy to find.",
  },
  {
    label: "Room",
    name: "room",
    placeholder: "Kitchen",
    helperText: "This will become a room relationship when saving is enabled.",
  },
  {
    label: "Notes",
    name: "notes",
    placeholder: "Optional asset notes",
    multiline: true,
    helperText: "Capture serial number locations, filter sizes or care notes.",
  },
];

export function getAssetEditShellFields(asset?: {
  name?: string | null;
  brand?: string | null;
  model?: string | null;
  roomName?: string | null;
  notes?: string | null;
} | null): ShellField[] {
  return assetShellFields.map((field) => ({
    ...field,
    defaultValue:
      field.name === "name"
        ? asset?.name ?? ""
        : field.name === "brand"
          ? asset?.brand ?? ""
          : field.name === "model"
            ? asset?.model ?? ""
            : field.name === "room"
              ? asset?.roomName ?? ""
              : field.name === "notes"
                ? asset?.notes ?? ""
                : field.defaultValue,
  }));
}

export const maintenanceTaskShellFields: ShellField[] = [
  {
    label: "Task title",
    name: "title",
    placeholder: "Clean air conditioner filters",
    recommended: true,
    helperText: "Use a practical action name your household will recognise.",
  },
  {
    label: "Description",
    name: "description",
    placeholder: "Rinse and dry split-system filters before reinstalling.",
    multiline: true,
    helperText: "Optional notes about what should be checked or serviced.",
  },
  {
    label: "Frequency",
    name: "frequency",
    placeholder: "QUARTERLY",
    recommended: true,
    helperText: "Use ONCE, MONTHLY, QUARTERLY, SIX_MONTHLY or YEARLY. Automation is not enabled yet.",
  },
  {
    label: "Next due date",
    name: "nextDueDate",
    placeholder: "2026-09-01",
    helperText: "Optional. Use YYYY-MM-DD for the clearest saved date.",
  },
  {
    label: "Linked asset",
    name: "assetName",
    placeholder: "Battery lawn mower",
    helperText: "Optional. If the asset name matches an existing asset, the task will be linked to it.",
  },
];

export function getMaintenanceTaskEditShellFields(task?: {
  title?: string | null;
  description?: string | null;
  frequency?: string | null;
  nextDueDate?: string | null;
  assetName?: string | null;
} | null): ShellField[] {
  return maintenanceTaskShellFields.map((field) => ({
    ...field,
    defaultValue:
      field.name === "title"
        ? task?.title ?? ""
        : field.name === "description"
          ? task?.description ?? ""
          : field.name === "frequency"
            ? task?.frequency ?? ""
            : field.name === "nextDueDate"
              ? task?.nextDueDate ?? ""
              : field.name === "assetName"
                ? task?.assetName ?? ""
                : field.defaultValue,
  }));
}

export const warrantyShellFields: ShellField[] = [
  {
    label: "Linked asset",
    name: "assetName",
    placeholder: "French door fridge",
    recommended: true,
    helperText: "Warranty records must link to an existing asset by name.",
  },
  {
    label: "Provider",
    name: "provider",
    placeholder: "Fisher & Paykel",
    helperText: "Manufacturer, retailer or warranty provider.",
  },
  {
    label: "Policy number",
    name: "policyNumber",
    placeholder: "Optional policy or reference number",
    helperText: "Useful for support calls and warranty claims.",
  },
  {
    label: "Start date",
    name: "startsAt",
    placeholder: "2024-03-14",
    helperText: "Optional. Use YYYY-MM-DD for the clearest saved date.",
  },
  {
    label: "Expiry date",
    name: "expiresAt",
    placeholder: "2026-03-14",
    helperText: "Optional. Reminder delivery is not enabled yet.",
  },
  {
    label: "Notes",
    name: "notes",
    placeholder: "Optional warranty notes",
    multiline: true,
    helperText: "Capture coverage details, exclusions or claim instructions. No document upload is connected yet.",
  },
];

export function getWarrantyEditShellFields(warranty?: {
  assetName?: string | null;
  provider?: string | null;
  policyNumber?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
} | null): ShellField[] {
  return warrantyShellFields.map((field) => ({
    ...field,
    defaultValue:
      field.name === "assetName"
        ? warranty?.assetName ?? ""
        : field.name === "provider"
          ? warranty?.provider ?? ""
          : field.name === "policyNumber"
            ? warranty?.policyNumber ?? ""
            : field.name === "startsAt"
              ? warranty?.startsAt ?? ""
              : field.name === "expiresAt"
                ? warranty?.expiresAt ?? ""
                : field.name === "notes"
                  ? warranty?.notes ?? ""
                  : field.defaultValue,
  }));
}
