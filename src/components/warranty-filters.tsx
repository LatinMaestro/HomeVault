import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterOption = {
  value: string;
  label: string;
};

type WarrantyFiltersProps = {
  query: string;
  coverage: string;
  asset: string;
  provider: string;
  assetOptions: FilterOption[];
  providerOptions: FilterOption[];
  resultCount: number;
};

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export function WarrantyFilters({
  query,
  coverage,
  asset,
  provider,
  assetOptions,
  providerOptions,
  resultCount,
}: WarrantyFiltersProps) {
  const hasFilters = Boolean(query.trim() || coverage || asset || provider);

  return (
    <div className="space-y-3 rounded-md border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Find and filter warranties
      </div>
      <form action="/warranties" className="grid gap-3 lg:grid-cols-4" method="get" role="search">
        <div className="lg:col-span-4">
          <label className="sr-only" htmlFor="warranty-search">
            Search warranties
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="warranty-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search assets, providers or policies"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="warranty-coverage">
            Coverage
          </label>
          <select
            id="warranty-coverage"
            name="coverage"
            defaultValue={coverage}
            className={selectClassName}
          >
            <option value="">Any coverage state</option>
            <option value="critical">Expired</option>
            <option value="attention">Expires within 30 days</option>
            <option value="normal">Current</option>
            <option value="missing">No expiry date</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="warranty-asset">
            Asset
          </label>
          <select id="warranty-asset" name="asset" defaultValue={asset} className={selectClassName}>
            <option value="">All assets</option>
            {assetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="warranty-provider">
            Provider
          </label>
          <select
            id="warranty-provider"
            name="provider"
            defaultValue={provider}
            className={selectClassName}
          >
            <option value="">All providers</option>
            <option value="unassigned">Provider not recorded</option>
            {providerOptions.map((option) => (
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
              <Link
                href="/warranties"
                aria-label="Clear warranty search and filters"
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
        {resultCount === 1 ? "warranty" : "warranties"}.
      </p>
    </div>
  );
}
