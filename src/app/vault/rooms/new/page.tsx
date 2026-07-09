import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { ShellForm } from "@/components/shell-form";
import { roomShellFields } from "@/lib/shell-form-fields";

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
          action={<BackLinkButton href="/vault/rooms">Back to rooms</BackLinkButton>}
        />
        <ShellForm
          title="Room details"
          description="Review the room fields that will support future saving. Saving is intentionally disabled until persistent CRUD is approved."
          fields={roomShellFields}
        />
      </section>
    </AppShell>
  );
}