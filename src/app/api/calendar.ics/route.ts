import { getHouseholdCalendar } from "@/lib/calendar-data";
import { buildHouseholdCalendar } from "@/lib/icalendar";

export const dynamic = "force-dynamic";

export async function GET() {
  const calendar = await getHouseholdCalendar();
  const body = buildHouseholdCalendar(calendar.data);

  return new Response(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="homevault-calendar.ics"',
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
