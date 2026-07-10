import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ReceiptText } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BackLinkButton } from "@/components/back-link-button";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Add Record",
  description: "Choose a receipt or document metadata record to add to HomeVault.",
};

export default function NewRecordPage() {
  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Receipts"
          title="What kind of record are you adding?"
          description="Choose a metadata record type. No file will be selected, uploaded or stored."
          action={<BackLinkButton href="/receipts">Back to records</BackLinkButton>}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <ReceiptText className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle>Receipt</CardTitle>
              <CardDescription>
                Record a merchant, purchase date, reference total, order number and optional linked asset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/receipts/new/receipt">Add receipt metadata</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle>Home document</CardTitle>
              <CardDescription>
                Record a manual, certificate, insurance note or service record without uploading a file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/receipts/new/document">Add document metadata</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
