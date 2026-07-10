const displayLabels: Record<string, string> = {
  ACTIVE: "Active",
  STORED: "Stored",
  REPAIR_NEEDED: "Needs repair",
  RETIRED: "Retired",
  DISPOSED: "Disposed",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
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
  OWNER: "Owner",
  ADULT: "Adult",
  CHILD: "Child",
  GUEST: "Guest",
  PENDING: "Pending",
  DONE: "Done",
  SNOOZED: "Snoozed",
  CANCELLED: "Cancelled",
};

export function getDisplayLabel(value?: string | null) {
  if (!value) return null;
  return displayLabels[value] ?? value;
}
