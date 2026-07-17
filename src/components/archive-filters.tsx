import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ArchiveFiltersProps = {
  query: string;
  recordType: string;
  resultCount: number;
};

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export function ArchiveFilters({ query, recordType, resultCount }: ArchiveFiltersProps) {
  const hasFilters = Boolean(query.trim() || recordType);

  return (
    <div className="space-y-3 rounded-md border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Find archived records
      </div>
      <form action="/archive" className="grid gap-3 lg:grid-cols-3" method="get" role="search">
        <div className="lg:col-span-3">
          <label className="sr-only" htmlFor="archive-search">
            Search archived records
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="archive-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search archived names, details or statuses"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1 lg:col-span-2">
          <label className="text-sm text-muted-foreground" htmlFor="archive-type">
            Record type
          </label>
          <select
            id="archive-type"
            name="type"
            defaultValue={recordType}
            className={selectClassName}
          >
            <option value="">All archived records</option>
            <option value="assets">Assets</option>
            <option value="tasks">Maintenance</option>
            <option value="reminders">Reminders</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">
            <Search className="h-4 w-4" aria-hidden="true" />
            Apply
          </Button>
          {hasFilters ? (
            <Button asChild variant="outline" size="icon">
              <Link href="/archive" aria-label="Clear archive search and filters" title="Clear filters">
                <X className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </div>
      </form>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {hasFilters ? "Found" : "Showing"} {resultCount}{" "}
        {resultCount === 1 ? "archived record" : "archived records"}.
      </p>
    </div>
  );
}
