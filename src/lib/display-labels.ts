const displayLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  RETIRED: "Retired",
  DRAFT: "Draft",
  COMPLETED: "Completed",
  ONCE: "One-off",
  WEEKLY: "Weekly",
  FORTNIGHTLY: "Fortnightly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  SIX_MONTHLY: "Every six months",
  YEARLY: "Yearly",
  CUSTOM: "Custom",
  MANUAL: "Manual",
  WARRANTY: "Warranty",
  RECEIPT: "Receipt",
  INSURANCE: "Insurance",
  SERVICE_RECORD: "Service record",
  CERTIFICATE: "Certificate",
  OTHER: "Other",
};

export function getDisplayLabel(value?: string | null) {
  if (!value) return null;
  return displayLabels[value] ?? value;
}
