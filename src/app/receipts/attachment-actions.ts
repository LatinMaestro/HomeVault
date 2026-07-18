"use server";

import { revalidatePath } from "next/cache";

import {
  deletePrivateAttachment,
  isAttachmentStorageConfigured,
  storePrivateAttachment,
  validateAttachmentFile,
} from "@/lib/attachment-storage";
import { getCurrentHouseholdWriteContext } from "@/lib/household-access";

export type AttachmentActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function error(message: string): AttachmentActionState {
  return { status: "error", message };
}

function revalidateDocument(documentId: string) {
  revalidatePath("/receipts");
  revalidatePath(`/receipts/${documentId}`);
}

async function getAttachmentContext() {
  const context = await getCurrentHouseholdWriteContext();
  if (
    !context ||
    context.access.mode !== "authenticated" ||
    !isAttachmentStorageConfigured()
  ) {
    return null;
  }
  return context;
}

export async function uploadDocumentAttachmentAction(
  documentId: string,
  _previousState: AttachmentActionState,
  formData: FormData,
): Promise<AttachmentActionState> {
  const selected = formData.get("attachment");
  if (!(selected instanceof File)) {
    return error("Choose a PDF, JPEG or PNG file before uploading.");
  }

  const validation = await validateAttachmentFile(selected);
  if (!validation.ok) return error(validation.message);

  const context = await getAttachmentContext();
  if (!context) {
    return error(
      "Private uploads require a verified account, an authorised household and connected private storage.",
    );
  }

  const document = await context.db.document.findFirst({
    where: { id: documentId, homeId: context.homeId },
    select: { id: true, storageKey: true },
  });
  if (!document) return error("This document was not found in your household.");
  if (document.storageKey) {
    return error("Remove the existing attachment before uploading a replacement.");
  }

  let stored: Awaited<ReturnType<typeof storePrivateAttachment>> | null = null;
  try {
    stored = await storePrivateAttachment({
      homeId: context.homeId,
      documentId,
      file: selected,
      extension: validation.extension,
      contentType: validation.contentType,
    });

    const updated = await context.db.document.updateMany({
      where: { id: documentId, homeId: context.homeId, storageKey: null },
      data: {
        fileName: selected.name,
        storageKey: stored.pathname,
        attachmentContentType: validation.contentType,
        attachmentEtag: stored.etag,
        attachmentSizeBytes: selected.size,
        attachmentUploadedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      await deletePrivateAttachment(stored.pathname);
      return error("The document changed before upload completed. No file was kept.");
    }

    revalidateDocument(documentId);
    return {
      status: "success",
      message: "The private attachment was uploaded and linked to this document.",
    };
  } catch {
    if (stored) {
      try {
        await deletePrivateAttachment(stored.pathname);
      } catch {
        // The Blob operations log is the recovery source for an interrupted compensating cleanup.
      }
    }
    return error("HomeVault could not safely store this attachment. Please try again.");
  }
}

export async function deleteDocumentAttachmentAction(
  documentId: string,
  _previousState: AttachmentActionState,
  _formData: FormData,
): Promise<AttachmentActionState> {
  const context = await getAttachmentContext();
  if (!context) {
    return error(
      "Removing a private file requires a verified account, an authorised household and connected private storage.",
    );
  }

  const document = await context.db.document.findFirst({
    where: { id: documentId, homeId: context.homeId },
    select: {
      storageKey: true,
      fileName: true,
      attachmentContentType: true,
      attachmentEtag: true,
      attachmentSizeBytes: true,
      attachmentUploadedAt: true,
    },
  });
  if (!document?.storageKey) return error("This document does not have a private attachment.");

  try {
    const cleared = await context.db.document.updateMany({
      where: {
        id: documentId,
        homeId: context.homeId,
        storageKey: document.storageKey,
      },
      data: {
        fileName: null,
        storageKey: null,
        attachmentContentType: null,
        attachmentEtag: null,
        attachmentSizeBytes: null,
        attachmentUploadedAt: null,
      },
    });
    if (cleared.count !== 1) {
      return error("The attachment changed before removal completed. Nothing was removed.");
    }

    try {
      await deletePrivateAttachment(document.storageKey);
    } catch {
      await context.db.document.update({
        where: { id: documentId },
        data: document,
      });
      return error("HomeVault could not remove the private file. Its record was restored.");
    }

    revalidateDocument(documentId);
    return { status: "success", message: "The private attachment was permanently removed." };
  } catch {
    return error("HomeVault could not safely remove this attachment. Please try again.");
  }
}
