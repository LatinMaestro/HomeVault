import { getMaintenanceTasks } from "@/lib/home-data";
import { buildMaintenanceHistoryCsv } from "@/lib/maintenance-history-csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const tasks = await getMaintenanceTasks();
  const body = buildMaintenanceHistoryCsv(tasks.data);

  return new Response(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="homevault-maintenance-history.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
