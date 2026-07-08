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
          ? "Showing records from the configured HomeVault database."
          : "Showing built-in sample records because a live database is not connected for this view."}
      </span>
    </div>
  );
}
