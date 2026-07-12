"use server";

import { revalidatePath } from "next/cache";

import { isAfterBrisbaneToday } from "@/lib/date-status";
import { getDb } from "@/lib/db";
import { sampleHome } from "@/lib/sample-data";

export type RecordActionState = {
  status: "idle" | "success" | "error";
  message: string;
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

function getDateValue(value: string) {
  if (!value) return null;

  const normalisedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;
  const date = new Date(normalisedValue);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getAmountCents(value: string) {
  if (!value) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return undefined;

  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : undefined;
}

async function getCurrentHomeId() {
  const home = await getDb().home.findFirst({
    where: { name: sampleHome.name },
    select: { id: true },
  });

  return home?.id ?? null;
}

async function getAssetId(homeId: string, assetName: string) {
  if (!assetName) return null;

  const asset = await getDb().asset.findFirst({
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
    message: `Saving needs a configured database. The page is still safe to review, but no ${recordType} was changed.`,
  };
}

function unknownFailureState(recordType: "receipt" | "document"): RecordActionState {
  return {
    status: "error",
    message: `HomeVault could not save this ${recordType}. Nothing was changed. Please try again after the database is available.`,
  };
}

async function resolveHomeAndAsset(assetName: string) {
  const homeId = await getCurrentHomeId();
  if (!homeId) return { homeId: null, assetId: null };

  const assetId = await getAssetId(homeId, assetName);
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
    purchaseDate: getDateValue(getFieldValue(formData, "purchaseDate")),
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
    return { status: "error", message: "Use a purchase total such as 2899.00, or leave it blank. Nothing was changed." };
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
  if (!process.env.DATABASE_URL) return unavailableState("receipt");

  try {
    const { homeId, assetId } = await resolveHomeAndAsset(values.assetName);
    if (!homeId) return missingHomeState();
    if (values.assetName && !assetId) return unmatchedAssetState();

    const receipt = await getDb().receipt.create({
      data: {
        homeId,
        assetId,
        merchant: values.merchant,
        purchaseDate: values.purchaseDate,
        totalAmountCents: values.totalAmountCents,
        currency: "AUD",
        receiptNumber: values.receiptNumber || null,
        notes: values.notes || null,
      },
      select: { id: true },
    });

    revalidateRecordPaths(receipt.id, assetId);
    return { status: "success", message: "Receipt metadata saved. You can now find it in the records list." };
  } catch {
    return unknownFailureState("receipt");
  }
}

export async function updateReceiptAction(
  receiptId: string,
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  const values = getReceiptValues(formData);
  const invalidState = invalidReceiptState(values);
  if (invalidState) return invalidState;
  if (!process.env.DATABASE_URL) return unavailableState("receipt");

  try {
    const { homeId, assetId } = await resolveHomeAndAsset(values.assetName);
    if (!homeId) return missingHomeState();
    if (values.assetName && !assetId) return unmatchedAssetState();

    const receipt = await getDb().receipt.findFirst({
      where: { id: receiptId, homeId },
      select: { id: true },
    });
    if (!receipt) {
      return { status: "error", message: "This receipt was not found in the configured database. Nothing was changed." };
    }

    await getDb().receipt.update({
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
    issuedAt: getDateValue(getFieldValue(formData, "issuedAt")),
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
  if (!process.env.DATABASE_URL) return unavailableState("document");

  try {
    const { homeId, assetId } = await resolveHomeAndAsset(values.assetName);
    if (!homeId) return missingHomeState();
    if (values.assetName && !assetId) return unmatchedAssetState();

    const document = await getDb().document.create({
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

    revalidateRecordPaths(document.id, assetId);
    return { status: "success", message: "Document metadata saved. No file was uploaded or stored." };
  } catch {
    return unknownFailureState("document");
  }
}

export async function updateDocumentAction(
  documentId: string,
  _previousState: RecordActionState,
  formData: FormData,
): Promise<RecordActionState> {
  const values = getDocumentValues(formData);
  const invalidState = invalidDocumentState(values);
  if (invalidState || !values.type) return invalidState ?? unknownFailureState("document");
  if (!process.env.DATABASE_URL) return unavailableState("document");

  try {
    const { homeId, assetId } = await resolveHomeAndAsset(values.assetName);
    if (!homeId) return missingHomeState();
    if (values.assetName && !assetId) return unmatchedAssetState();

    const document = await getDb().document.findFirst({
      where: { id: documentId, homeId },
      select: { id: true },
    });
    if (!document) {
      return { status: "error", message: "This document was not found in the configured database. Nothing was changed." };
    }

    await getDb().document.update({
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
    return { status: "success", message: "Document metadata updated. No file was uploaded or stored." };
  } catch {
    return unknownFailureState("document");
  }
}
