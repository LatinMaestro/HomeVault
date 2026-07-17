import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterOption = {
  value: string;
  label: string;
};

type RecordFiltersProps = {
  query: string;
  recordType: string;
  asset: string;
  documentType: string;
  assetOptions: FilterOption[];
  documentTypeOptions: FilterOption[];
  resultCount: number;
};

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

export function RecordFilters({
  query,
  recordType,
  asset,
  documentType,
  assetOptions,
  documentTypeOptions,
  resultCount,
}: RecordFiltersProps) {
  const hasFilters = Boolean(query.trim() || recordType || asset || documentType);

  return (
    <div className="space-y-3 rounded-md border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Find and filter records
      </div>
      <form action="/receipts" className="grid gap-3 lg:grid-cols-4" method="get" role="search">
        <div className="lg:col-span-4">
          <label className="sr-only" htmlFor="record-search">
            Search receipts and documents
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="record-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search records, assets or document types"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="record-type">
            Record type
          </label>
          <select
            id="record-type"
            name="type"
            defaultValue={recordType}
            className={selectClassName}
          >
            <option value="">Receipts and documents</option>
            <option value="Receipt">Receipts</option>
            <option value="Document">Documents</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="record-asset">
            Linked asset
          </label>
          <select id="record-asset" name="asset" defaultValue={asset} className={selectClassName}>
            <option value="">Any asset link</option>
            <option value="unassigned">No linked asset</option>
            {assetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="document-type">
            Document type
          </label>
          <select
            id="document-type"
            name="documentType"
            defaultValue={documentType}
            className={selectClassName}
          >
            <option value="">All document types</option>
            {documentTypeOptions.map((option) => (
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
                href="/receipts"
                aria-label="Clear record search and filters"
                title="Clear filters"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </div>
      </form>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {hasFilters ? "Found" : "Showing"} {resultCount} {resultCount === 1 ? "record" : "records"}.
      </p>
    </div>
  );
}
