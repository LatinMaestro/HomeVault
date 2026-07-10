export type DateStatus = {
  label: string;
  tone: "critical" | "attention" | "normal" | "missing";
};

type DateStatusContext = "maintenance" | "warranty";

const brisbaneDateFormatter = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Brisbane",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getBrisbaneDateSerial(now: Date) {
  const parts = Object.fromEntries(
    brisbaneDateFormatter
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function getDateSerial(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const serial = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const date = new Date(serial);

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return serial;
}

export function getDateStatus(
  value: string | null | undefined,
  context: DateStatusContext,
  now = new Date(),
): DateStatus {
  if (!value) {
    return {
      label: context === "maintenance" ? "No due date" : "No expiry date",
      tone: "missing",
    };
  }

  const targetDate = getDateSerial(value);
  if (targetDate === null) {
    return { label: "Date unavailable", tone: "missing" };
  }

  const daysAway = Math.round((targetDate - getBrisbaneDateSerial(now)) / 86_400_000);

  if (context === "warranty") {
    if (daysAway < 0) return { label: "Expired", tone: "critical" };
    if (daysAway === 0) return { label: "Expires today", tone: "attention" };
    if (daysAway <= 30) return { label: "Expires soon", tone: "attention" };
    return { label: "Current", tone: "normal" };
  }

  if (daysAway < 0) {
    const overdueDays = Math.abs(daysAway);
    return {
      label: `Overdue by ${overdueDays} ${overdueDays === 1 ? "day" : "days"}`,
      tone: "critical",
    };
  }
  if (daysAway === 0) return { label: "Due today", tone: "attention" };
  if (daysAway <= 30) {
    return {
      label: `Due in ${daysAway} ${daysAway === 1 ? "day" : "days"}`,
      tone: "attention",
    };
  }
  return { label: "Scheduled", tone: "normal" };
}
