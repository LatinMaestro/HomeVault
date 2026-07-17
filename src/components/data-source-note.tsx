import { Database, FlaskConical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { DataSource } from "@/lib/sample-data";

export function DataSourceNote({ source }: { source: DataSource }) {
  const isDatabase = source === "database";
  const Icon = isDatabase ? Database : FlaskConical;

  return (
    <aside
      aria-label="Data source"
      className="rounded-md border bg-card px-3 py-3 text-sm text-muted-foreground"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <Badge variant={isDatabase ? "default" : "secondary"}>
            {isDatabase ? "Database" : "Sample data"}
          </Badge>
          <p className="leading-6">
            {isDatabase
              ? "Showing records from the configured HomeVault database."
              : "Showing built-in sample records because controlled preview database access is unavailable for this view."}
          </p>
        </div>
      </div>
    </aside>
  );
}
