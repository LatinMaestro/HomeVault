import Link from "next/link";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ListSearchProps = {
  action: string;
  defaultValue: string;
  label: string;
  placeholder: string;
  resultCount: number;
  resultNoun: string;
  resultNounPlural?: string;
};

export function ListSearch({
  action,
  defaultValue,
  label,
  placeholder,
  resultCount,
  resultNoun,
  resultNounPlural,
}: ListSearchProps) {
  const hasQuery = defaultValue.trim().length > 0;
  const inputId = `list-search-${resultNoun.replaceAll(" ", "-")}`;

  return (
    <div className="space-y-2">
      <form action={action} className="flex flex-col gap-2 sm:flex-row" method="get" role="search">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id={inputId}
            name="q"
            type="search"
            defaultValue={defaultValue}
            placeholder={placeholder}
            aria-label={label}
            className="pl-9"
          />
        </div>
        <Button type="submit">
          <Search className="h-4 w-4" aria-hidden="true" />
          Search
        </Button>
        {hasQuery ? (
          <Button asChild type="button" variant="outline">
            <Link href={action}>
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </Link>
          </Button>
        ) : null}
      </form>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {hasQuery ? "Found" : "Showing"} {resultCount}{" "}
        {resultCount === 1 ? resultNoun : resultNounPlural ?? `${resultNoun}s`}.
      </p>
    </div>
  );
}
