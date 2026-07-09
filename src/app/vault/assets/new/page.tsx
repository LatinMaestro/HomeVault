import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { ShellForm } from "@/components/shell-form";
import { assetShellFields } from "@/lib/shell-form-fields";

export const metadata: Metadata = {
  title: "New Asset",
  description: "Preview the non-saving HomeVault asset form.",
};

export default function NewAssetPage() {
  return (
    <AppShell activeSection="Vault">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Assets"
          title="Create asset shell"
          description="This form previews the future asset workflow. It does not save records yet."
          action={<BackLinkButton href="/vault/assets">Back to assets</BackLinkButton>}
        />
        <ShellForm
          title="Asset details"
          description="Review the asset fields that will support future saving. Saving is intentionally disabled until persistent CRUD is approved."
          fields={assetShellFields}
        />
      </section>
    </AppShell>
  );
}