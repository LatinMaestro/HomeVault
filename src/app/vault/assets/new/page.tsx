import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ShellForm } from "@/components/shell-form";

export default function NewAssetPage() {
  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Assets"
          title="Create asset shell"
          description="This form previews the future asset workflow. It does not save records in Phase 1C."
        />
        <ShellForm
          title="Asset details"
          description="Saving is intentionally disabled until persistent CRUD is approved."
          fields={[
            { label: "Asset name", name: "name", placeholder: "French door fridge" },
            { label: "Brand", name: "brand", placeholder: "Fisher & Paykel" },
            { label: "Model", name: "model", placeholder: "RF605QDUVX1" },
            { label: "Room", name: "room", placeholder: "Kitchen" },
            { label: "Notes", name: "notes", placeholder: "Optional asset notes", multiline: true },
          ]}
        />
      </section>
    </AppShell>
  );
}
