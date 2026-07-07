import { Badge } from "@/components/ui/badge";
import type { DataSource } from "@/lib/sample-data";

export function DataSourceNote({ source }: { source: DataSource }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Badge variant={source === "database" ? "default" : "secondary"}>
        {source === "database" ? "Database" : "Sample data"}
      </Badge>
      <span>
        {source === "database"
          ? "Reading from the configured HomeVault database."
          : "Using built-in sample data because DATABASE_URL is not configured or unavailable."}
      </span>
    </div>
  );
}
