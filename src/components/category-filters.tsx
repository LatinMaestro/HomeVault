import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CategoryFiltersProps = {
  query: string;
  usage: string;
  resultCount: number;
};

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export function CategoryFilters({ query, usage, resultCount }: CategoryFiltersProps) {
  const hasFilters = Boolean(query.trim() || usage);

  return (
    <div className="space-y-3 rounded-md border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Find and filter categories
      </div>
      <form
        action="/vault/categories"
        className="grid gap-3 lg:grid-cols-3"
        method="get"
        role="search"
      >
        <div className="lg:col-span-3">
          <label className="sr-only" htmlFor="category-search">
            Search asset categories
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="category-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search category names or descriptions"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1 lg:col-span-2">
          <label className="text-sm text-muted-foreground" htmlFor="category-usage">
            Asset links
          </label>
          <select
            id="category-usage"
            name="usage"
            defaultValue={usage}
            className={selectClassName}
          >
            <option value="">Any asset count</option>
            <option value="used">Has assigned assets</option>
            <option value="empty">No assigned assets</option>
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
                href="/vault/categories"
                aria-label="Clear category search and filters"
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
        {resultCount === 1 ? "category" : "categories"}.
      </p>
    </div>
  );
}
