export type MaintenanceHistoryTask = {
  title: string;
  assetName?: string | null;
  frequency: string;
  status: string;
  nextDueDate?: string | null;
  completions: Array<{
    completedAt: string;
    completedBy?: string | null;
    notes?: string | null;
  }>;
};

function spreadsheetSafe(value: string) {
  return /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
}

function cell(value: string | number | null | undefined) {
  const safeValue = spreadsheetSafe(value === null || value === undefined ? "" : String(value));
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export function buildMaintenanceHistoryCsv(tasks: MaintenanceHistoryTask[]) {
  const rows = [
    [
      "Task",
      "Asset",
      "Completed date",
      "Completed by",
      "Completion notes",
      "Frequency",
      "Current status",
      "Next due",
    ],
    ...tasks.flatMap((task) =>
      task.completions.map((completion) => [
        task.title,
        task.assetName,
        completion.completedAt,
        completion.completedBy,
        completion.notes,
        task.frequency,
        task.status,
        task.nextDueDate,
      ]),
    ),
  ];

  return `${rows.map((row) => row.map((value) => cell(value)).join(",")).join("\r\n")}\r\n`;
}
