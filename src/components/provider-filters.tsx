import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterOption = {
  value: string;
  label: string;
};

type ProviderFiltersProps = {
  query: string;
  trade: string;
  workload: string;
  contact: string;
  tradeOptions: FilterOption[];
  resultCount: number;
};

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export function ProviderFilters({
  query,
  trade,
  workload,
  contact,
  tradeOptions,
  resultCount,
}: ProviderFiltersProps) {
  const hasFilters = Boolean(query.trim() || trade || workload || contact);

  return (
    <div className="space-y-3 rounded-md border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Find and filter providers
      </div>
      <form
        action="/maintenance/providers"
        className="grid gap-3 lg:grid-cols-4"
        method="get"
        role="search"
      >
        <div className="lg:col-span-4">
          <label className="sr-only" htmlFor="provider-search">
            Search service providers
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="provider-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search providers, trades or tasks"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="provider-trade">
            Trade
          </label>
          <select id="provider-trade" name="trade" defaultValue={trade} className={selectClassName}>
            <option value="">All trades</option>
            <option value="unassigned">Trade not recorded</option>
            {tradeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="provider-workload">
            Maintenance links
          </label>
          <select
            id="provider-workload"
            name="workload"
            defaultValue={workload}
            className={selectClassName}
          >
            <option value="">Any task count</option>
            <option value="linked">Has linked tasks</option>
            <option value="unlinked">No linked tasks</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="provider-contact">
            Contact details
          </label>
          <select
            id="provider-contact"
            name="contact"
            defaultValue={contact}
            className={selectClassName}
          >
            <option value="">Any contact state</option>
            <option value="available">Contact method recorded</option>
            <option value="missing">No contact method</option>
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
                href="/maintenance/providers"
                aria-label="Clear provider search and filters"
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
        {resultCount === 1 ? "provider" : "providers"}.
      </p>
    </div>
  );
}
