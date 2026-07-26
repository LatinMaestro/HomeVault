"use client";

import { useActionState } from "react";
import { CheckCircle2, Download, Eye, FileUp, Trash2, TriangleAlert } from "lucide-react";

import {
  deleteDocumentAttachmentAction,
  uploadDocumentAttachmentAction,
  type AttachmentActionState,
} from "@/app/receipts/attachment-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: AttachmentActionState = { status: "idle", message: "" };

function formatBytes(value?: number | null) {
  if (!value) return null;
  return value < 1_000_000
    ? `${Math.ceil(value / 1_000)} KB`
    : `${(value / 1_000_000).toFixed(1)} MB`;
}

export function DocumentAttachmentPanel({
  documentId,
  fileName,
  contentType,
  sizeBytes,
  uploadedAt,
  enabled,
}: {
  documentId: string;
  fileName?: string | null;
  contentType?: string | null;
  sizeBytes?: number | null;
  uploadedAt?: string | null;
  enabled: boolean;
}) {
  const uploadAction = uploadDocumentAttachmentAction.bind(null, documentId);
  const deleteAction = deleteDocumentAttachmentAction.bind(null, documentId);
  const [uploadState, uploadFormAction, uploadPending] = useActionState(
    uploadAction,
    initialState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAction,
    initialState,
  );
  const state = deleteState.message ? deleteState : uploadState;
  const hasAttachment = Boolean(fileName && contentType && sizeBytes && uploadedAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Private attachment</CardTitle>
        <CardDescription>
          PDF, JPEG or PNG up to 4 MB. Files are available only through an authorised HomeVault download.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {hasAttachment ? (
          <>
            <div className="rounded-md border bg-background p-4">
              <a
                href={`/api/attachments/${documentId}?disposition=inline`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {fileName}
              </a>
              <p className="mt-1 text-sm text-muted-foreground">
                {contentType} · {formatBytes(sizeBytes)} · Added {uploadedAt}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a
                  href={`/api/attachments/${documentId}?disposition=inline`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  View
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`/api/attachments/${documentId}`}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </a>
              </Button>
              <form action={deleteFormAction}>
                <Button type="submit" variant="destructive" disabled={!enabled || deletePending}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {deletePending ? "Removing..." : "Remove file"}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <form action={uploadFormAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="attachment" className="text-sm font-medium text-foreground">
                Choose a file
              </label>
              <input
                id="attachment"
                name="attachment"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                required
                disabled={!enabled || uploadPending}
                className="block min-h-11 w-full rounded-md border bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-secondary-foreground"
              />
            </div>
            <Button type="submit" disabled={!enabled || uploadPending}>
              <FileUp className="h-4 w-4" aria-hidden="true" />
              {uploadPending ? "Uploading..." : "Upload privately"}
            </Button>
            {!enabled ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Private uploads become available after production sign-in, database migrations and a private Blob store are connected.
              </p>
            ) : null}
          </form>
        )}

        {state.message ? (
          <div
            className="flex items-start gap-3 rounded-md border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
            role="status"
            aria-live="polite"
          >
            {state.status === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            ) : (
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            )}
            <span>{state.message}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
