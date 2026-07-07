import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ShellForm } from "@/components/shell-form";
import { getRooms } from "@/lib/home-data";

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
          description="This edit screen is a non-saving Phase 1C shell."
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
