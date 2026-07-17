import { getAssets, getMaintenanceTasks, getReminders } from "@/lib/home-data";

export function isArchivedAsset(status: string) {
  return status === "RETIRED" || status === "DISPOSED";
}

export function isArchivedMaintenanceTask(status: string) {
  return status === "COMPLETED" || status === "ARCHIVED";
}

export function isArchivedReminder(status: string) {
  return status === "DONE" || status === "CANCELLED";
}

export async function getArchiveData() {
  const [assets, tasks, reminders] = await Promise.all([
    getAssets(),
    getMaintenanceTasks(),
    getReminders(),
  ]);

  return {
    source: [assets, tasks, reminders].every((result) => result.source === "database")
      ? ("database" as const)
      : ("sample" as const),
    assets: assets.data.filter((asset) => isArchivedAsset(asset.status)),
    tasks: tasks.data.filter((task) => isArchivedMaintenanceTask(task.status)),
    reminders: reminders.data.filter((reminder) => isArchivedReminder(reminder.status)),
  };
}
