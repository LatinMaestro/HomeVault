export type MaintenanceFrequencyValue =
  | "ONCE"
  | "WEEKLY"
  | "FORTNIGHTLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "SIX_MONTHLY"
  | "YEARLY"
  | "CUSTOM";

export type MaintenanceScheduleResult =
  | { kind: "completed"; nextDueDate: null; status: "COMPLETED" }
  | { kind: "advanced"; nextDueDate: Date; status: null }
  | { kind: "unchanged"; nextDueDate: Date | null; status: null };

function laterDate(left: Date | null, right: Date) {
  return left && left.getTime() > right.getTime() ? new Date(left) : new Date(right);
}

function addUtcDays(value: Date, days: number) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function addUtcMonths(value: Date, months: number) {
  const result = new Date(value);
  const preferredDay = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const finalDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(preferredDay, finalDay));

  return result;
}

export function getMaintenanceScheduleAfterCompletion({
  frequency,
  customIntervalDays,
  completedAt,
  nextDueDate,
}: {
  frequency: MaintenanceFrequencyValue;
  customIntervalDays: number | null;
  completedAt: Date;
  nextDueDate: Date | null;
}): MaintenanceScheduleResult {
  if (frequency === "ONCE") {
    return { kind: "completed", nextDueDate: null, status: "COMPLETED" };
  }

  const anchor = laterDate(nextDueDate, completedAt);

  if (frequency === "WEEKLY") {
    return { kind: "advanced", nextDueDate: addUtcDays(anchor, 7), status: null };
  }
  if (frequency === "FORTNIGHTLY") {
    return { kind: "advanced", nextDueDate: addUtcDays(anchor, 14), status: null };
  }
  if (frequency === "MONTHLY") {
    return { kind: "advanced", nextDueDate: addUtcMonths(anchor, 1), status: null };
  }
  if (frequency === "QUARTERLY") {
    return { kind: "advanced", nextDueDate: addUtcMonths(anchor, 3), status: null };
  }
  if (frequency === "SIX_MONTHLY") {
    return { kind: "advanced", nextDueDate: addUtcMonths(anchor, 6), status: null };
  }
  if (frequency === "YEARLY") {
    return { kind: "advanced", nextDueDate: addUtcMonths(anchor, 12), status: null };
  }
  if (
    frequency === "CUSTOM" &&
    customIntervalDays !== null &&
    Number.isInteger(customIntervalDays) &&
    customIntervalDays > 0
  ) {
    return {
      kind: "advanced",
      nextDueDate: addUtcDays(anchor, customIntervalDays),
      status: null,
    };
  }

  return { kind: "unchanged", nextDueDate, status: null };
}
