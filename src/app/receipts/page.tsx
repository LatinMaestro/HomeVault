import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DataSourceNote } from "@/components/data-source-note";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecords } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const records = await getRecords();

  return (
    <AppShell activeSection="Receipts">
      <section className="space-y-5">
        <PageHeader
          eyebrow="Receipts"
          title="A calm place for receipts and important home documents."
          description="Phase 1C shows metadata only. Uploads and production file storage remain out of scope."
        />
        <DataSourceNote source={records.source} />

        <div className="grid gap-4">
          {records.data.map((record) => (
            <Link key={record.id} href={`/receipts/${record.id}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{record.title}</CardTitle>
                      <CardDescription>{record.secondary}</CardDescription>
                    </div>
                    <Badge variant="secondary">{record.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{record.date || "No date"}</span>
                  {record.linkedAsset ? <span>{record.linkedAsset}</span> : null}
                  {record.amount ? <span>{record.amount}</span> : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

