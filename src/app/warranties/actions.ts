"use server";

import { revalidatePath } from "next/cache";

import { getCurrentHomeId } from "@/lib/current-home";
import { getDb, isPreviewDatabaseEnabled } from "@/lib/db";
import { getOptionalDateValue } from "@/lib/form-values";

export type WarrantyActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
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

function unavailableState(): WarrantyActionState {
  return {
    status: "error",
    message: "Saving is not enabled for this preview. The page is still safe to review, but no warranty was changed.",
  };
}

function unknownFailureState(): WarrantyActionState {
  return {
    status: "error",
    message: "HomeVault could not save this warranty. Nothing was changed. Please try again after the database is available.",
  };
}

function getWarrantyValues(formData: FormData) {
  return {
    assetName: getFieldValue(formData, "assetName"),
    provider: getFieldValue(formData, "provider"),
    policyNumber: getFieldValue(formData, "policyNumber"),
    startsAt: getOptionalDateValue(getFieldValue(formData, "startsAt")),
    expiresAt: getOptionalDateValue(getFieldValue(formData, "expiresAt")),
    notes: getFieldValue(formData, "notes"),
  };
}

function invalidWarrantyState(values: ReturnType<typeof getWarrantyValues>): WarrantyActionState | null {
  if (!values.assetName) {
    return { status: "error", message: "Add the linked asset name before saving." };
  }

  if (values.startsAt === undefined || values.expiresAt === undefined) {
    return {
      status: "error",
      message: "Use readable dates such as 2026-09-01. Nothing was changed.",
    };
  }

  if (values.startsAt && values.expiresAt && values.expiresAt < values.startsAt) {
    return {
      status: "error",
      message: "The warranty expiry date cannot be before its start date. Nothing was changed.",
    };
  }

  return null;
}

export async function createWarrantyAction(
  _previousState: WarrantyActionState,
  formData: FormData,
): Promise<WarrantyActionState> {
  const values = getWarrantyValues(formData);
  const invalidState = invalidWarrantyState(values);
  if (invalidState) return invalidState;

  if (!isPreviewDatabaseEnabled()) {
    return unavailableState();
  }

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();

    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving warranties.",
      };
    }

    const assetId = await getAssetId(homeId, values.assetName);

    if (!assetId) {
      return {
        status: "error",
        message: "This warranty needs an existing asset. Check the asset name and try again.",
      };
    }

    await db.warranty.create({
      data: {
        homeId,
        assetId,
        provider: values.provider || null,
        policyNumber: values.policyNumber || null,
        startsAt: values.startsAt,
        expiresAt: values.expiresAt,
        notes: values.notes || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/warranties");
    revalidatePath(`/vault/assets/${assetId}`);

    return { status: "success", message: "Warranty saved. You can now find it in the warranty list." };
  } catch {
    return unknownFailureState();
  }
}

export async function updateWarrantyAction(
  warrantyId: string,
  _previousState: WarrantyActionState,
  formData: FormData,
): Promise<WarrantyActionState> {
  const values = getWarrantyValues(formData);
  const invalidState = invalidWarrantyState(values);
  if (invalidState) return invalidState;

  if (!isPreviewDatabaseEnabled()) {
    return unavailableState();
  }

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();

    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving warranties.",
      };
    }

    const warranty = await db.warranty.findFirst({
      where: { id: warrantyId, homeId },
      select: { id: true, assetId: true },
    });

    if (!warranty) {
      return {
        status: "error",
        message: "This warranty was not found in the configured database. Nothing was changed.",
      };
    }

    const assetId = await getAssetId(homeId, values.assetName);

    if (!assetId) {
      return {
        status: "error",
        message: "This warranty needs an existing asset. Check the asset name and try again.",
      };
    }

    await db.warranty.update({
      where: { id: warrantyId },
      data: {
        assetId,
        provider: values.provider || null,
        policyNumber: values.policyNumber || null,
        startsAt: values.startsAt,
        expiresAt: values.expiresAt,
        notes: values.notes || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/warranties");
    revalidatePath(`/warranties/${warrantyId}`);
    revalidatePath(`/warranties/${warrantyId}/edit`);
    revalidatePath(`/vault/assets/${warranty.assetId}`);
    revalidatePath(`/vault/assets/${assetId}`);

    return { status: "success", message: "Warranty updated. The warranty list now reflects this change." };
  } catch {
    return unknownFailureState();
  }
}
