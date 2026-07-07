import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ShellForm } from "@/components/shell-form";

export default function NewRoomPage() {
  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Rooms"
          title="Create room shell"
          description="This form previews the future room workflow. It does not save records in Phase 1C."
        />
        <ShellForm
          title="Room details"
          description="Saving is intentionally disabled until persistent CRUD is approved."
          fields={[
            { label: "Room name", name: "name", placeholder: "Kitchen" },
            { label: "Floor or zone", name: "floor", placeholder: "Ground floor" },
            { label: "Notes", name: "notes", placeholder: "Optional room notes", multiline: true },
          ]}
        />
      </section>
    </AppShell>
  );
}
