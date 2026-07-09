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
}): ShellField[] {
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
