export type CalendarExportItem = {
  id: string;
  title: string;
  detail: string;
  dateInput: string;
};

function escapeText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function compactDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}${month}${day}`;
}

function timestamp(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function buildHouseholdCalendar(
  items: CalendarExportItem[],
  generatedAt = new Date(),
) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HomeVault//Household Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:HomeVault",
  ];

  for (const item of items) {
    const date = compactDate(item.dateInput);
    if (!date) continue;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${safeId(item.id)}@homevault`,
      `DTSTAMP:${timestamp(generatedAt)}`,
      `DTSTART;VALUE=DATE:${date}`,
      `SUMMARY:${escapeText(item.title)}`,
      `DESCRIPTION:${escapeText(item.detail)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR", "");
  return lines.join("\r\n");
}
