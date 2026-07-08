import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ShellForm } from "@/components/shell-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "New Room",
  description: "Preview the non-saving HomeVault room form.",
};

export default function NewRoomPage() {
  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Rooms"
          title="Create room shell"
          description="This form previews the future room workflow. It does not save records yet."
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
            { label: "Room name", name: "name", placeholder: "Kitchen" },
            { label: "Floor or zone", name: "floor", placeholder: "Ground floor" },
            { label: "Notes", name: "notes", placeholder: "Optional room notes", multiline: true },
          ]}
        />
      </section>
    </AppShell>
  );
}