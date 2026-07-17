import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { ListSearch } from "@/components/list-search";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { searchHousehold } from "@/lib/household-search";
import { getQueryParam } from "@/lib/list-filter";

export const metadata: Metadata = {
  title: "Search",
  description: "Find household records across HomeVault.",
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const query = getQueryParam((await searchParams).q);
  const search = await searchHousehold(query);
  const groups = Map.groupBy(search.results, (result) => result.group);

  return (
    <AppShell activeSection="Search">
      <section className="space-y-5">
        <PageHeader
          eyebrow="HomeVault"
          title="Search household records"
          description="Find assets, rooms, maintenance, warranties, reminders, providers, receipts and documents in one place."
        />

        <ListSearch
          action="/search"
          defaultValue={query}
          label="Search HomeVault"
          placeholder="Try an appliance, room, provider or document"
          resultCount={search.results.length}
          resultNoun="result"
        />

        {query ? <DataSourceNote source={search.source} /> : null}

        {!query ? (
          <EmptyState
            title="What are you looking for?"
            description="Search the household vault by name, brand, room, provider, status, date or other recorded metadata."
          />
        ) : search.results.length ? (
          <div className="grid gap-4">
            {Array.from(groups.entries()).map(([group, results]) => (
              <Card key={group}>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                  <div>
                    <CardTitle>{group}</CardTitle>
                    <CardDescription>
                      {results.length} {results.length === 1 ? "matching record" : "matching records"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{results.length}</Badge>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={result.href}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{result.title}</p>
                        <p className="mt-1 break-words text-sm leading-5 text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No household records match"
            description="Try a shorter term, a room name, an appliance brand, a provider or a document title."
          />
        )}
      </section>
    </AppShell>
  );
}
