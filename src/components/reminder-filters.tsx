import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterOption = {
  value: string;
  label: string;
};

type ReminderFiltersProps = {
  query: string;
  status: string;
  due: string;
  link: string;
  statusOptions: FilterOption[];
  resultCount: number;
};

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export function ReminderFilters({
  query,
  status,
  due,
  link,
  statusOptions,
  resultCount,
}: ReminderFiltersProps) {
  const hasFilters = Boolean(query.trim() || status || due || link);

  return (
    <div className="space-y-3 rounded-md border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Find and filter reminders
      </div>
      <form
        action="/maintenance/reminders"
        className="grid gap-3 lg:grid-cols-4"
        method="get"
        role="search"
      >
        <div className="lg:col-span-4">
          <label className="sr-only" htmlFor="reminder-search">
            Search reminders
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="reminder-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search reminders or linked records"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="reminder-status">
            Status
          </label>
          <select
            id="reminder-status"
            name="status"
            defaultValue={status}
            className={selectClassName}
          >
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="reminder-due">
            Due state
          </label>
          <select id="reminder-due" name="due" defaultValue={due} className={selectClassName}>
            <option value="">Any due state</option>
            <option value="critical">Overdue</option>
            <option value="attention">Due within 30 days</option>
            <option value="normal">Scheduled later</option>
            <option value="missing">No due date</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="reminder-link">
            Linked record
          </label>
          <select id="reminder-link" name="link" defaultValue={link} className={selectClassName}>
            <option value="">Any link</option>
            <option value="asset">Asset</option>
            <option value="warranty">Warranty</option>
            <option value="task">Maintenance task</option>
            <option value="unassigned">No linked record</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">
            <Search className="h-4 w-4" aria-hidden="true" />
            Apply
          </Button>
          {hasFilters ? (
            <Button asChild variant="outline" size="icon">
              <Link
                href="/maintenance/reminders"
                aria-label="Clear reminder search and filters"
                title="Clear filters"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </div>
      </form>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {hasFilters ? "Found" : "Showing"} {resultCount}{" "}
        {resultCount === 1 ? "reminder" : "reminders"}.
      </p>
    </div>
  );
}
