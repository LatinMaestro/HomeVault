import type { ShellField } from "@/components/shell-form";
import type {
  AssetDetail,
  MaintenanceTaskDetail,
  ReminderDetail,
  WarrantyDetail,
} from "@/lib/sample-data";

export function getReminderFields({
  reminder,
  assets,
  warranties,
  tasks,
}: {
  reminder?: ReminderDetail | null;
  assets: AssetDetail[];
  warranties: WarrantyDetail[];
  tasks: MaintenanceTaskDetail[];
}): ShellField[] {
  return [
    {
      label: "Reminder title",
      name: "title",
      defaultValue: reminder?.title ?? "",
      placeholder: "Review fridge warranty",
      helperText: "Describe the action the household needs to remember.",
      recommended: true,
    },
    {
      label: "Due date",
      name: "dueAt",
      defaultValue: reminder?.dueAtInput ?? "",
      inputType: "date",
      helperText: "This date is shown in HomeVault but does not trigger a notification.",
      recommended: true,
    },
    {
      label: "Status",
      name: "status",
      defaultValue: reminder?.status ?? "PENDING",
      recommended: true,
      options: [
        { label: "Pending", value: "PENDING" },
        { label: "Done", value: "DONE" },
        { label: "Snoozed", value: "SNOOZED" },
        { label: "Cancelled", value: "CANCELLED" },
      ],
    },
    {
      label: "Linked asset",
      name: "assetId",
      defaultValue: reminder?.assetId ?? "",
      emptyOptionLabel: "No linked asset",
      options: assets.map((asset) => ({ label: asset.name, value: asset.id })),
    },
    {
      label: "Linked warranty",
      name: "warrantyId",
      defaultValue: reminder?.warrantyId ?? "",
      emptyOptionLabel: "No linked warranty",
      options: warranties.map((warranty) => ({
        label: `${warranty.assetName} warranty`,
        value: warranty.id,
      })),
    },
    {
      label: "Linked maintenance task",
      name: "taskId",
      defaultValue: reminder?.taskId ?? "",
      emptyOptionLabel: "No linked task",
      options: tasks.map((task) => ({ label: task.title, value: task.id })),
    },
    {
      label: "Notes",
      name: "notes",
      defaultValue: reminder?.notes ?? "",
      placeholder: "Optional context for the household",
      multiline: true,
    },
  ];
}
