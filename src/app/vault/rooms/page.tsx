import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRooms } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Rooms"
          title="Rooms and home zones"
          description="Review the spaces that organise household assets and records."
          action={
            <Button asChild>
              <Link href="/vault/rooms/new">New room</Link>
            </Button>
          }
        />
        <DataSourceNote source={rooms.source} />

        <div className="grid gap-4 md:grid-cols-2">
          {rooms.data.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>{room.floor || "Floor not recorded"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{room.assetCount} linked assets</p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/vault/rooms/${room.id}/edit`}>Edit shell</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
