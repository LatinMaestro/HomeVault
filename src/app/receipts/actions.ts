"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAfterBrisbaneToday } from "@/lib/date-status";
import {
  getCurrentHouseholdWriteContext,
  type HouseholdWriteContext,
} from "@/lib/household-access";
import {
  deletePrivateAttachment,
  isAttachmentStorageConfigured,
  storePrivateAttachment,
  validateAttachmentFile,
  type AllowedAttachmentType,
} from "@/lib/attachment-storage";
import { getOptionalDateValue } from "@/lib/form-values";

export type RecordActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const maxReceiptAmountCents = 2_147_483_647;

type PendingAttachment = {
  file: File;
  contentType: AllowedAttachmentType;
  extension: string;
};

const documentTypes = [
  "MANUAL",
  "WARRANTY",
  "RECEIPT",
  "INSURANCE",
  "SERVICE_RECORD",
  "CERTIFICATE",
  "OTHER",
] as const;

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

async function getOptionalAttachment(formData: FormData): Promise<{
  attachment: PendingAttachment | null;
  error: RecordActionState | null;
}> {
  const selected = formData.get("attachment");
  if (!(selected instanceof File) || selected.size === 0) {
    return { attachment: null, error: null };
  }

  const validation = await validateAttachmentFile(selected);
  if (!validation.ok) {
    return {
      attachment: null,
      error: { status: "error", message: validation.message },
    };
  }

  return {
    attachment: {
      file: selected,
      contentType: validation.contentType,
      extension: validation.extension,
    },
    error: null,
  };
}

function attachmentUnavailableState(): RecordActionState {
  return {
    status: "error",
    message:
      "Private file saving requires a verified account, an authorised household and connected private storage. Nothing was saved.",
  };
}

function canStoreAttachment(context: HouseholdWriteContext) {
  return (
    context.access.mode === "authenticated" &&
    isAttachmentStorageConfigured()
  );
}

async function persistAttachment(
  context: HouseholdWriteContext,
  documentId: string,
  attachment: PendingAttachment,
) {
  let stored: Awaited<ReturnType<typeof storePrivateAttachment>> | null = null;

  try {
    stored = await storePrivateAttachment({
      homeId: context.homeId,
      documentId,
      file: attachment.file,
      extension: attachment.extension,
      contentType: attachment.contentType,
    });

    await context.db.document.update({
      where: { id: documentId },
      data: {
        fileName: attachment.file.name,
        storageKey: stored.pathname,
        attachmentContentType: attachment.contentType,
        attachmentEtag: stored.etag,
        attachmentSizeBytes: attachment.file.size,
        attachmentUploadedAt: new Date(),
      },
    });
  } catch (error) {
    if (stored) {
      try {
        await deletePrivateAttachment(stored.pathname);
      } catch {
        // Blob operation logs remain the recovery source for interrupted cleanup.
      }
    }
    throw error;
  }
}

function getAmountCents(value: string) {
  if (!value) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return undefined;

  const amountCents = Math.round(Number(value) * 100);
  return Number.isSafeInteger(amountCents) && amountCents <= maxReceiptAmountCents
    ? amountCents
    : undefined;
}

async function getAssetId(context: HouseholdWriteContext, assetName: string) {
  const homeId = context.homeId;
  if (!assetName) return null;

  const asset = await context.db.asset.findFirst({
    where: {
      homeId,
      name: { equals: assetName, mode: "insensitive" },
    },
    select: { id: true },
  });

  return asset?.id ?? null;
}

function unavailableState(recordType: "receipt" | "document"): RecordActionState {
  return {
    status: "error",
    message: `Saving is not enabled for this preview. The page is still safe to review, but no ${recordType} was changed.`,
  };
}

function unknownFailureState(recordType: "receipt" | "document"): RecordActionState {
  return {
    status: "error",
    message: `HomeVault could not save this ${recordType}. Nothing was changed. Please try again after the database is available.`,
  };
}

async function resolveHomeAndAsset(context: HouseholdWriteContext, assetName: string) {
  const homeId = context.homeId;
  const assetId = await getAssetId(context, assetName);
  return { homeId, assetId };
}

function missingHomeState(): RecordActionState {
  return {
    status: "error",
    message: "The sample home could not be found in the database. Seed the database before saving records.",
  };
}

function unmatchedAssetState(): RecordActionState {
  return {
    status: "error",
    message: "The linked asset name does not match an existing asset. Check the name or leave it blank.",
  };
}

function revalidateRecordPaths(recordId?: string, assetId?: string | null) {
  revalidatePath("/");
  revalidatePath("/receipts");
  if (recordId) {
    revalidatePath(`/receipts/${recordId}`);
    revalidatePath(`/receipts/${recordId}/edit`);
  }
  if (assetId) revalidatePath(`/vault/assets/${assetId}`);
}

function getReceiptValues(formData: FormData) {
  return {
    merchant: getFieldValue(formData, "merchant"),
    purchaseDate: getOptionalDateValue(getFieldValue(formData, "purchaseDate")),
    totalAmountCents: getAmountCents(getFieldValue(formData, "totalAmount")),
    receiptNumber: getFieldValue(formData, "receiptNumber"),
    assetName: getFieldValue(formData, "assetName"),
    notes: getFieldValue(formData, "notes"),
  };
}

function invalidReceiptState(values: ReturnType<typeof getReceiptValues>): RecordActionState | null {
  if (!values.merchant) {
    return { status: "error", message: "Add the merchant before saving." };
  }
  if (values.purchaseDate === undefined) {
    return { status: "error", message: "Use a readable purchase date such as 2026-09-01. Nothing was changed." };
  }
  if (values.purchaseDate && isAfterBrisbaneToday(values.purchaseDate)) {
    return { status: "error", message: "A receipt purchase date cannot be in the future. Nothing was changed." };
  }
  if (values.totalAmountCents === undefined) {
    return { status: "error", message: "Use a purchase total from 0.00 to 21474836.47, or leave it blank. Nothing was changed." };
  }
  return null;
}

export async function createReceiptAction(
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  const values = getReceiptValues(formData);
  const invalidState = invalidReceiptState(values);
  if (invalidState) return invalidState;

  const selected = await getOptionalAttachment(formData);
  if (selected.error) return selected.error;

  const context = await getCurrentHouseholdWriteContext();
  if (!context) return unavailableState("receipt");
  if (selected.attachment && !canStoreAttachment(context)) {
    return attachmentUnavailableState();
  }

  let savedReceiptId = "";

  try {
    const { homeId, assetId } = await resolveHomeAndAsset(context, values.assetName);
    if (!homeId) return missingHomeState();
    if (values.assetName && !assetId) return unmatchedAssetState();

    const receipt = await context.db.receipt.create({
      data: {
        homeId,
        assetId,
        merchant: values.merchant,
        purchaseDate: values.purchaseDate,
        totalAmountCents: values.totalAmountCents,
        currency: "AUD",
        receiptNumber: values.receiptNumber || null,
        notes: values.notes || null,
        documents: {
          create: {
            homeId,
            assetId,
            title: `${values.merchant} receipt`,
            type: "RECEIPT",
            issuedAt: values.purchaseDate,
          },
        },
      },
      select: {
        id: true,
        documents: { select: { id: true }, take: 1 },
      },
    });

    savedReceiptId = receipt.id;
    const attachmentDocument = receipt.documents[0];
    if (!attachmentDocument) throw new Error("Receipt attachment record was not created.");
    if (selected.attachment) {
      await persistAttachment(context, attachmentDocument.id, selected.attachment);
    }

    revalidateRecordPaths(receipt.id, assetId);
  } catch {
    if (savedReceiptId) {
      try {
        await context.db.$transaction([
          context.db.document.deleteMany({ where: { receiptId: savedReceiptId } }),
          context.db.receipt.deleteMany({ where: { id: savedReceiptId, homeId: context.homeId } }),
        ]);
      } catch {
        // The database operation log remains the recovery source for interrupted cleanup.
      }
    }
    return unknownFailureState("receipt");
  }

  redirect(`/receipts/${savedReceiptId}`);
}
export async function updateReceiptAction(
  receiptId: string,
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  const values = getReceiptValues(formData);
  const invalidState = invalidReceiptState(values);
  if (invalidState) return invalidState;
  const context = await getCurrentHouseholdWriteContext();

  if (!context) return unavailableState("receipt");

  try {
    const { homeId, assetId } = await resolveHomeAndAsset(context, values.assetName);
    if (!homeId) return missingHomeState();
    if (values.assetName && !assetId) return unmatchedAssetState();

    const receipt = await context.db.receipt.findFirst({
      where: { id: receiptId, homeId },
      select: { id: true, assetId: true },
    });
    if (!receipt) {
      return { status: "error", message: "This receipt was not found in the configured database. Nothing was changed." };
    }

    await context.db.receipt.update({
      where: { id: receiptId },
      data: {
        assetId,
        merchant: values.merchant,
        purchaseDate: values.purchaseDate,
        totalAmountCents: values.totalAmountCents,
        currency: "AUD",
        receiptNumber: values.receiptNumber || null,
        notes: values.notes || null,
      },
    });

    revalidateRecordPaths(receiptId, assetId);
    if (receipt.assetId) revalidatePath(`/vault/assets/${receipt.assetId}`);
    return { status: "success", message: "Receipt metadata updated. The records list now reflects this change." };
  } catch {
    return unknownFailureState("receipt");
  }
}

function getDocumentValues(formData: FormData) {
  const type = getFieldValue(formData, "documentType");
  return {
    title: getFieldValue(formData, "title"),
    type: documentTypes.find((documentType) => documentType === type),
    issuedAt: getOptionalDateValue(getFieldValue(formData, "issuedAt")),
    assetName: getFieldValue(formData, "assetName"),
    notes: getFieldValue(formData, "notes"),
  };
}

function invalidDocumentState(values: ReturnType<typeof getDocumentValues>): RecordActionState | null {
  if (!values.title) {
    return { status: "error", message: "Add a document title before saving." };
  }
  if (!values.type) {
    return { status: "error", message: "Use a supported document type such as MANUAL or SERVICE_RECORD. Nothing was changed." };
  }
  if (values.issuedAt === undefined) {
    return { status: "error", message: "Use a readable issue date such as 2026-09-01. Nothing was changed." };
  }
  if (values.issuedAt && isAfterBrisbaneToday(values.issuedAt)) {
    return { status: "error", message: "A document issue date cannot be in the future. Nothing was changed." };
  }
  return null;
}

export async function createDocumentAction(
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  const values = getDocumentValues(formData);
  const invalidState = invalidDocumentState(values);
  if (invalidState || !values.type) return invalidState ?? unknownFailureState("document");

  const selected = await getOptionalAttachment(formData);
  if (selected.error) return selected.error;

  const context = await getCurrentHouseholdWriteContext();
  if (!context) return unavailableState("document");
  if (selected.attachment && !canStoreAttachment(context)) {
    return attachmentUnavailableState();
  }

  let savedDocumentId = "";

  try {
    const { homeId, assetId } = await resolveHomeAndAsset(context, values.assetName);
    if (!homeId) return missingHomeState();
    if (values.assetName && !assetId) return unmatchedAssetState();

    const document = await context.db.document.create({
      data: {
        homeId,
        assetId,
        title: values.title,
        type: values.type,
        issuedAt: values.issuedAt,
        notes: values.notes || null,
      },
      select: { id: true },
    });

    savedDocumentId = document.id;
    if (selected.attachment) {
      await persistAttachment(context, document.id, selected.attachment);
    }
    revalidateRecordPaths(document.id, assetId);
  } catch {
    if (savedDocumentId) {
      try {
        await context.db.document.deleteMany({
          where: { id: savedDocumentId, homeId: context.homeId },
        });
      } catch {
        // The database operation log remains the recovery source for interrupted cleanup.
      }
    }
    return unknownFailureState("document");
  }

  redirect(`/receipts/${savedDocumentId}`);
}
export async function updateDocumentAction(
  documentId: string,
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  const values = getDocumentValues(formData);
  const invalidState = invalidDocumentState(values);
  if (invalidState || !values.type) return invalidState ?? unknownFailureState("document");
  const context = await getCurrentHouseholdWriteContext();

  if (!context) return unavailableState("document");

  try {
    const { homeId, assetId } = await resolveHomeAndAsset(context, values.assetName);
    if (!homeId) return missingHomeState();
    if (values.assetName && !assetId) return unmatchedAssetState();

    const document = await context.db.document.findFirst({
      where: { id: documentId, homeId },
      select: { id: true, assetId: true },
    });
    if (!document) {
      return { status: "error", message: "This document was not found in the configured database. Nothing was changed." };
    }

    await context.db.document.update({
      where: { id: documentId },
      data: {
        assetId,
        title: values.title,
        type: values.type,
        issuedAt: values.issuedAt,
        notes: values.notes || null,
      },
    });

    revalidateRecordPaths(documentId, assetId);
    if (document.assetId) revalidatePath(`/vault/assets/${document.assetId}`);
    return { status: "success", message: "Document metadata updated. No file was uploaded or stored." };
  } catch {
    return unknownFailureState("document");
  }
}
