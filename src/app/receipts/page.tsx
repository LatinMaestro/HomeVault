import { SectionPlaceholder } from "@/components/section-placeholder";

export default function ReceiptsPage() {
  return (
    <SectionPlaceholder
      section="Receipts"
      title="A calm place for receipts and important home documents."
      description="Phase 1 keeps document handling as metadata and placeholders only. Uploads and storage wait for approval."
      items={["Receipt register", "Document categories", "Purchase records", "Storage approval placeholder"]}
    />
  );
}

