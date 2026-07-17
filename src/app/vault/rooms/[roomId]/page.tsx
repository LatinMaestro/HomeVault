import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { DataSourceNote } from "@/components/data-source-note";
import { EmptyState } from "@/components/empty-state";
import { FieldList } from "@/components/field-list";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDisplayLabel } from "@/lib/display-labels";
import { getRoom } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Room Detail",
  description: "Review a HomeVault room and its linked household records.",
};

export const dynamic = "force-dynamic";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = await getRoom(roomId);

  if (!room.data) {
    return (
      <AppShell activeSection="Vault">
        <section className="space-y-5">
          <PageHeader
            eyebrow="Rooms"
            title="Room not found"
            description="This room was not found in the current HomeVault data source."
          />
          <DataSourceNote source={room.source} />
          <EmptyState
            title="No matching room"
            description="The room may no longer exist in the configured database or may not be part of the built-in sample household."
            action={<BackLinkButton href="/vault/rooms">Back to rooms</BackLinkButton>}
          />
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Rooms"
          title={room.data.name}
          description="Review this space, its household assets and maintenance linked through those assets."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <BackLinkButton href="/vault/rooms">Back to rooms</BackLinkButton>
              <Button asChild variant="outline">
                <Link href={`/vault/rooms/${room.data.id}/edit`}>Edit room</Link>
              </Button>
            </div>
          }
        />
        <DataSourceNote source={room.source} />

        <Card>
          <CardHeader>
            <CardTitle>Room information</CardTitle>
            <CardDescription>
              {room.data.assetCount === 1
                ? "1 asset is organised in this room."
                : `${room.data.assetCount} assets are organised in this room.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldList
              fields={[
                { label: "Floor or level", value: room.data.floor },
                { label: "Notes", value: room.data.notes },
              ]}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Assets</CardTitle>
              <CardDescription>Household items assigned to this room.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {room.data.assets.length > 0 ? (
                room.data.assets.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/vault/assets/${asset.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <span>
                      <span className="block font-medium text-foreground">{asset.name}</span>
                      <span className="block text-sm text-muted-foreground">
                        {asset.brand || "Brand not recorded"}
                      </span>
                    </span>
                    <Badge variant="secondary">{getDisplayLabel(asset.status)}</Badge>
                  </Link>
                ))
              ) : (
                <EmptyState
                  title="No assets in this room"
                  description="Assign an asset to this room to keep its records and maintenance easy to find."
                  action={
                    <Button asChild variant="outline">
                      <Link href="/vault/assets/new">Add asset</Link>
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked maintenance</CardTitle>
              <CardDescription>Tasks connected through assets in this room.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {room.data.maintenanceTasks.length > 0 ? (
                room.data.maintenanceTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/maintenance/${task.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    <span>
                      <span className="block font-medium text-foreground">{task.title}</span>
                      <span className="block text-sm text-muted-foreground">
                        {task.nextDueDate ? `Due ${task.nextDueDate}` : "No due date recorded"}
                      </span>
                    </span>
                    <Badge variant="secondary">{getDisplayLabel(task.status)}</Badge>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No maintenance tasks are linked through this room&apos;s assets yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
