import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterOption = {
  value: string;
  label: string;
};

type AssetFiltersProps = {
  query: string;
  room: string;
  category: string;
  status: string;
  roomOptions: FilterOption[];
  categoryOptions: FilterOption[];
  statusOptions: FilterOption[];
  resultCount: number;
};

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export function AssetFilters({
  query,
  room,
  category,
  status,
  roomOptions,
  categoryOptions,
  statusOptions,
  resultCount,
}: AssetFiltersProps) {
  const hasFilters = Boolean(query.trim() || room || category || status);

  return (
    <div className="space-y-3 rounded-md border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Find and filter assets
      </div>
      <form action="/vault/assets" className="grid gap-3 lg:grid-cols-4" method="get" role="search">
        <div className="lg:col-span-4">
          <label className="sr-only" htmlFor="asset-search">
            Search assets
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="asset-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search assets, serials, rooms or brands"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="asset-room">
            Room
          </label>
          <select id="asset-room" name="room" defaultValue={room} className={selectClassName}>
            <option value="">All rooms</option>
            <option value="unassigned">No room</option>
            {roomOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="asset-category">
            Category
          </label>
          <select
            id="asset-category"
            name="category"
            defaultValue={category}
            className={selectClassName}
          >
            <option value="">All categories</option>
            <option value="unassigned">No category</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="asset-status">
            Status
          </label>
          <select id="asset-status" name="status" defaultValue={status} className={selectClassName}>
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">
            <Search className="h-4 w-4" aria-hidden="true" />
            Apply
          </Button>
          {hasFilters ? (
            <Button asChild variant="outline" size="icon">
              <Link href="/vault/assets" aria-label="Clear asset search and filters" title="Clear filters">
                <X className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </div>
      </form>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {hasFilters ? "Found" : "Showing"} {resultCount} {resultCount === 1 ? "asset" : "assets"}.
      </p>
    </div>
  );
}
