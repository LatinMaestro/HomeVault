import type { ShellField } from "@/components/shell-form";

export function withFieldOptions(
  fields: ShellField[],
  fieldName: string,
  values: string[],
  emptyOptionLabel: string,
): ShellField[] {
  return fields.map((field) =>
    field.name === fieldName
      ? {
          ...field,
          options: values.map((value) => ({ label: value, value })),
          emptyOptionLabel,
        }
      : field,
  );
}

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
    label: "Serial number",
    name: "serialNumber",
    placeholder: "Optional serial number",
    helperText: "Useful for support calls, repairs, insurance records and warranty claims.",
  },
  {
    label: "Room",
    name: "room",
    placeholder: "Kitchen",
    helperText: "Choose an existing room, or leave the asset unlinked.",
  },
  {
    label: "Purchase date",
    name: "purchaseDate",
    placeholder: "2024-03-14",
    inputType: "date",
    helperText: "Optional. Choose the original purchase date when known.",
  },
  {
    label: "Purchase place",
    name: "purchasePlace",
    placeholder: "The Good Guys Mount Gravatt",
    helperText: "Optional retailer, supplier or previous owner.",
  },
  {
    label: "Asset status",
    name: "status",
    recommended: true,
    defaultValue: "ACTIVE",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Stored", value: "STORED" },
      { label: "Needs repair", value: "REPAIR_NEEDED" },
      { label: "Retired", value: "RETIRED" },
      { label: "Disposed", value: "DISPOSED" },
    ],
    emptyOptionLabel: "Choose an asset status",
    helperText: "Use status instead of deleting an asset when its household role changes.",
  },
  {
    label: "Notes",
    name: "notes",
    placeholder: "Optional asset notes",
    multiline: true,
    helperText: "Capture filter sizes, care instructions, identifying marks or service notes.",
  },
];

export function getAssetEditShellFields(asset?: {
  name?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  roomName?: string | null;
  purchaseDateInput?: string | null;
  purchasePlace?: string | null;
  status?: string | null;
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
            : field.name === "serialNumber"
              ? asset?.serialNumber ?? ""
              : field.name === "room"
                ? asset?.roomName ?? ""
                : field.name === "purchaseDate"
                  ? asset?.purchaseDateInput ?? ""
                  : field.name === "purchasePlace"
                    ? asset?.purchasePlace ?? ""
                    : field.name === "status"
                      ? asset?.status ?? "ACTIVE"
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
    options: [
      { label: "One-off", value: "ONCE" },
      { label: "Weekly", value: "WEEKLY" },
      { label: "Fortnightly", value: "FORTNIGHTLY" },
      { label: "Monthly", value: "MONTHLY" },
      { label: "Quarterly", value: "QUARTERLY" },
      { label: "Every six months", value: "SIX_MONTHLY" },
      { label: "Yearly", value: "YEARLY" },
      { label: "Custom", value: "CUSTOM" },
    ],
    emptyOptionLabel: "Choose a frequency",
    helperText: "Choose how often this task is normally due. Automation is not enabled yet.",
  },
  {
    label: "Next due date",
    name: "nextDueDate",
    placeholder: "2026-09-01",
    inputType: "date",
    helperText: "Optional. Choose the next date this task is due.",
  },
  {
    label: "Linked asset",
    name: "assetName",
    placeholder: "Battery lawn mower",
    helperText: "Optional. Choose an existing asset to link this task.",
  },
];

export function getMaintenanceTaskEditShellFields(task?: {
  title?: string | null;
  description?: string | null;
  frequency?: string | null;
  nextDueDate?: string | null;
  nextDueDateInput?: string | null;
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
              ? task?.nextDueDateInput ?? ""
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
    helperText: "Choose the existing asset covered by this warranty.",
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
    inputType: "date",
    helperText: "Optional. Choose when coverage started.",
  },
  {
    label: "Expiry date",
    name: "expiresAt",
    placeholder: "2026-03-14",
    inputType: "date",
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
  startsAtInput?: string | null;
  expiresAt?: string | null;
  expiresAtInput?: string | null;
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
              ? warranty?.startsAtInput ?? ""
              : field.name === "expiresAt"
                ? warranty?.expiresAtInput ?? ""
                : field.name === "notes"
                  ? warranty?.notes ?? ""
                  : field.defaultValue,
  }));
}


export const receiptShellFields: ShellField[] = [
  {
    label: "Merchant",
    name: "merchant",
    placeholder: "The Good Guys Mount Gravatt",
    recommended: true,
    helperText: "Use the retailer or service provider shown on the receipt.",
  },
  {
    label: "Purchase date",
    name: "purchaseDate",
    placeholder: "2024-03-14",
    inputType: "date",
    helperText: "Optional. Choose the purchase date.",
  },
  {
    label: "Purchase total (AUD)",
    name: "totalAmount",
    placeholder: "2899.00",
    inputType: "number",
    min: "0",
    step: "0.01",
    helperText: "Optional archival reference only. HomeVault does not create budgets or spending reports.",
  },
  {
    label: "Receipt or order number",
    name: "receiptNumber",
    placeholder: "Optional reference number",
    helperText: "Useful when contacting a retailer or making a warranty claim.",
  },
  {
    label: "Linked asset",
    name: "assetName",
    placeholder: "French door fridge",
    helperText: "Optional. Choose an existing asset to link this record.",
  },
  {
    label: "Notes",
    name: "notes",
    placeholder: "Optional receipt notes",
    multiline: true,
    helperText: "Capture return conditions or reference details. No receipt image is uploaded.",
  },
];

export function getReceiptEditShellFields(receipt?: {
  merchant?: string | null;
  purchaseDateInput?: string | null;
  totalAmountCents?: number | null;
  receiptNumber?: string | null;
  linkedAsset?: string | null;
  notes?: string | null;
} | null): ShellField[] {
  return receiptShellFields.map((field) => ({
    ...field,
    defaultValue:
      field.name === "merchant"
        ? receipt?.merchant ?? ""
        : field.name === "purchaseDate"
          ? receipt?.purchaseDateInput ?? ""
          : field.name === "totalAmount"
            ? typeof receipt?.totalAmountCents === "number"
              ? (receipt.totalAmountCents / 100).toFixed(2)
              : ""
            : field.name === "receiptNumber"
              ? receipt?.receiptNumber ?? ""
              : field.name === "assetName"
                ? receipt?.linkedAsset ?? ""
                : field.name === "notes"
                  ? receipt?.notes ?? ""
                  : field.defaultValue,
  }));
}

export const documentShellFields: ShellField[] = [
  {
    label: "Document title",
    name: "title",
    placeholder: "Fridge manual",
    recommended: true,
    helperText: "Use a title your household can recognise quickly.",
  },
  {
    label: "Document type",
    name: "documentType",
    placeholder: "MANUAL",
    recommended: true,
    options: [
      { label: "Manual", value: "MANUAL" },
      { label: "Warranty", value: "WARRANTY" },
      { label: "Receipt", value: "RECEIPT" },
      { label: "Insurance", value: "INSURANCE" },
      { label: "Service record", value: "SERVICE_RECORD" },
      { label: "Certificate", value: "CERTIFICATE" },
      { label: "Other", value: "OTHER" },
    ],
    emptyOptionLabel: "Choose a document type",
    helperText: "Choose the category that best describes this record.",
  },
  {
    label: "Issue date",
    name: "issuedAt",
    placeholder: "2026-03-01",
    inputType: "date",
    helperText: "Optional. Choose the date shown on the document.",
  },
  {
    label: "Linked asset",
    name: "assetName",
    placeholder: "French door fridge",
    helperText: "Optional. Choose an existing asset to link this record.",
  },
  {
    label: "Notes",
    name: "notes",
    placeholder: "Optional document notes",
    multiline: true,
    helperText: "Describe where the original is kept or what it covers. No file is uploaded or stored.",
  },
];

export function getDocumentEditShellFields(document?: {
  title?: string | null;
  documentType?: string | null;
  issuedAtInput?: string | null;
  linkedAsset?: string | null;
  notes?: string | null;
} | null): ShellField[] {
  return documentShellFields.map((field) => ({
    ...field,
    defaultValue:
      field.name === "title"
        ? document?.title ?? ""
        : field.name === "documentType"
          ? document?.documentType ?? ""
          : field.name === "issuedAt"
            ? document?.issuedAtInput ?? ""
            : field.name === "assetName"
              ? document?.linkedAsset ?? ""
              : field.name === "notes"
                ? document?.notes ?? ""
                : field.defaultValue,
  }));
}
