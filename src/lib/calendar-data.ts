import { getMaintenanceTasks, getReminders, getWarranties } from "@/lib/home-data";
import type { DataSource } from "@/lib/sample-data";

export type HouseholdCalendarItem = {
  id: string;
  kind: "maintenance" | "reminder" | "warranty";
  title: string;
  detail: string;
  date: string;
  dateInput: string;
  href: string;
};

export async function getHouseholdCalendar(): Promise<{
  data: HouseholdCalendarItem[];
  source: DataSource;
}> {
  const [tasks, reminders, warranties] = await Promise.all([
    getMaintenanceTasks(),
    getReminders(),
    getWarranties(),
  ]);

  const items: HouseholdCalendarItem[] = [
    ...tasks.data
      .filter((task) => task.status === "ACTIVE" && task.nextDueDateInput)
      .map((task) => ({
        id: `maintenance-${task.id}`,
        kind: "maintenance" as const,
        title: task.title,
        detail: task.assetName ?? "Household maintenance",
        date: task.nextDueDate ?? task.nextDueDateInput ?? "",
        dateInput: task.nextDueDateInput ?? "",
        href: `/maintenance/${task.id}`,
      })),
    ...reminders.data
      .filter(
        (reminder) =>
          (reminder.status === "PENDING" || reminder.status === "SNOOZED") &&
          reminder.dueAtInput,
      )
      .map((reminder) => ({
        id: `reminder-${reminder.id}`,
        kind: "reminder" as const,
        title: reminder.title,
        detail:
          reminder.assetName ??
          reminder.taskTitle ??
          reminder.warrantyName ??
          "Household reminder",
        date: reminder.dueAt,
        dateInput: reminder.dueAtInput,
        href: `/maintenance/reminders/${reminder.id}`,
      })),
    ...warranties.data
      .filter((warranty) => warranty.expiresAtInput)
      .map((warranty) => ({
        id: `warranty-${warranty.id}`,
        kind: "warranty" as const,
        title: `${warranty.assetName} warranty expires`,
        detail: warranty.provider ?? "Warranty coverage",
        date: warranty.expiresAt ?? warranty.expiresAtInput ?? "",
        dateInput: warranty.expiresAtInput ?? "",
        href: `/warranties/${warranty.id}`,
      })),
  ].sort(
    (left, right) =>
      left.dateInput.localeCompare(right.dateInput) || left.title.localeCompare(right.title),
  );

  return {
    data: items,
    source:
      tasks.source === "database" &&
      reminders.source === "database" &&
      warranties.source === "database"
        ? "database"
        : "sample",
  };
}
