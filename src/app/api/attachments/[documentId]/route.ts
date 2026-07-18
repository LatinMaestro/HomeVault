import { getHouseholdDb, getCurrentHouseholdAccess } from "@/lib/household-access";
import {
  getPrivateAttachment,
  isAttachmentStorageConfigured,
} from "@/lib/attachment-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unavailable(status: number, message: string) {
  return new Response(message, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const access = await getCurrentHouseholdAccess();
  if (!access || access.mode !== "authenticated") {
    return unavailable(401, "Sign in to download this attachment.");
  }
  if (!isAttachmentStorageConfigured()) {
    return unavailable(503, "Private attachment storage is unavailable.");
  }

  const { documentId } = await params;
  const document = await getHouseholdDb(access).document.findFirst({
    where: { id: documentId, homeId: access.homeId },
    select: {
      storageKey: true,
      fileName: true,
      attachmentContentType: true,
      attachmentSizeBytes: true,
    },
  });

  if (
    !document?.storageKey ||
    !document.fileName ||
    !document.attachmentContentType
  ) {
    return unavailable(404, "Attachment not found.");
  }

  try {
    const blob = await getPrivateAttachment(document.storageKey);
    if (!blob) return unavailable(404, "Attachment not found.");

    const encodedName = encodeURIComponent(document.fileName);
    return new Response(blob.stream, {
      status: blob.statusCode,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": document.attachmentContentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedName}`,
        ...(document.attachmentSizeBytes
          ? { "Content-Length": String(document.attachmentSizeBytes) }
          : {}),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return unavailable(502, "HomeVault could not retrieve this attachment.");
  }
}
