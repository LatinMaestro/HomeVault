import { isCurrentHouseholdWritable } from "@/lib/household-access";

import type { Metadata } from "next";

import { updateRoomAction } from "@/app/vault/rooms/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { RoomForm } from "@/components/room-form";
import { getRooms } from "@/lib/home-data";
import { getRoomEditShellFields } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "Edit Room",
  description: "Edit a HomeVault room when database persistence is configured.",
};

export const dynamic = "force-dynamic";

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const rooms = await getRooms();
  const room = rooms.data.find((item) => item.id === roomId);
  const updateAction = updateRoomAction.bind(null, roomId);

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Rooms"
          title={`Edit ${room?.name ?? "room"}`}
          description="Save room changes when database persistence is available. Sample or unavailable database states remain safe and non-destructive."
          action={<BackLinkButton href="/vault/rooms">Back to rooms</BackLinkButton>}
        />
        <RoomForm
          title="Room details"
          description="Room saving is now enabled when this room exists in the configured database. If this is sample data, HomeVault will explain that nothing changed."
          fields={getRoomEditShellFields(room)}
          action={updateAction}
          databaseConfigured={await isCurrentHouseholdWritable()}
        />
      </section>
    </AppShell>
  );
}