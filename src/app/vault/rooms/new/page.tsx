import { isPreviewDatabaseEnabled } from "@/lib/db";

import type { Metadata } from "next";

import { createRoomAction } from "@/app/vault/rooms/actions";
import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { RoomForm } from "@/components/room-form";
import { roomShellFields } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "New Room",
  description: "Create a HomeVault room when database persistence is configured.",
};

export default function NewRoomPage() {
  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Rooms"
          title="Create room"
          description="Save a room to organise household assets and records when database persistence is available."
          action={<BackLinkButton href="/vault/rooms">Back to rooms</BackLinkButton>}
        />
        <RoomForm
          title="Room details"
          description="Room saving is now enabled when the database is configured. If the database is unavailable, HomeVault will explain that nothing changed."
          fields={roomShellFields}
          action={createRoomAction}
          databaseConfigured={isPreviewDatabaseEnabled()}
        />
      </section>
    </AppShell>
  );
}