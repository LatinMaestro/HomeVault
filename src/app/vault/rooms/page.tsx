import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { ListSearch } from "@/components/list-search";
import { PageHeader } from "@/components/page-header";
import { ReviewSummary } from "@/components/review-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRooms } from "@/lib/home-data";
import { getQueryParam, matchesQuery } from "@/lib/list-filter";

export const metadata: Metadata = {
  title: "Rooms",
  description: "Review and manage HomeVault rooms and home zones for household records.",
};

export const dynamic = "force-dynamic";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const query = getQueryParam((await searchParams).q);
  const rooms = await getRooms();
  const visibleRooms = rooms.data.filter((room) =>
    matchesQuery(query, [room.name, room.floor, room.notes]),
  );
  const linkedAssetCount = rooms.data.reduce((total, room) => total + room.assetCount, 0);

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Rooms"
          title="Rooms and home zones"
          description="Review spaces that organise household assets and save room changes when a database is configured."
          action={
            <Button asChild>
              <Link href="/vault/rooms/new">New room</Link>
            </Button>
          }
        />
        <DataSourceNote source={rooms.source} />
        <ReviewSummary
          items={[
            {
              label: "Rooms",
              value: `${rooms.data.length}`,
              detail: rooms.data.length === 1 ? "Home zone available for review." : "Home zones available for review.",
            },
            {
              label: "Linked assets",
              value: `${linkedAssetCount}`,
              detail: "Assets are grouped by room where the current data source includes that link.",
            },
            {
              label: "Data",
              value: rooms.source === "database" ? "Database" : "Sample",
              detail: "Room screens stay reviewable without a live database.",
            },
          ]}
        />

        <ListSearch
          action="/vault/rooms"
          defaultValue={query}
          label="Search rooms"
          placeholder="Search rooms or zones"
          resultCount={visibleRooms.length}
          resultNoun="room"
        />

        {visibleRooms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleRooms.map((room) => (
              <Card key={room.id}>
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                  <CardDescription>{room.floor || "Floor not recorded"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{room.assetCount} linked assets</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/vault/rooms/${room.id}/edit`}>Edit room</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title={query ? "No matching rooms" : "No rooms yet"}
            description={
              query
                ? "Try another room name or clear the current search."
                : "Rooms help group assets by kitchen, laundry, garage, outdoor areas and other home zones. Add the first room when database saving is configured."
            }
            action={
              <Button asChild variant="outline">
                <Link href={query ? "/vault/rooms" : "/vault/rooms/new"}>
                  {query ? "Clear search" : "Add room"}
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </AppShell>
  );
}
