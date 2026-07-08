import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ShellForm } from "@/components/shell-form";
import { Button } from "@/components/ui/button";
import { getRooms } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Edit Room Shell",
  description: "Preview the non-saving HomeVault room edit form.",
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

  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Rooms"
          title={`Edit ${room?.name ?? "room"} shell`}
          description="This edit screen previews the future room workflow. It does not save records yet."
          action={
            <Button asChild variant="outline">
              <Link href="/vault/rooms">Back to rooms</Link>
            </Button>
          }
        />
        <ShellForm
          title="Room details"
          description="Saving is intentionally disabled until persistent CRUD is approved."
          fields={[
            { label: "Room name", name: "name", defaultValue: room?.name, placeholder: "Kitchen" },
            { label: "Floor or zone", name: "floor", defaultValue: room?.floor ?? "", placeholder: "Ground floor" },
            { label: "Notes", name: "notes", defaultValue: room?.notes ?? "", multiline: true },
          ]}
        />
      </section>
    </AppShell>
  );
}