"use server";

import { revalidatePath } from "next/cache";

import { getDb } from "@/lib/db";
import { sampleHome } from "@/lib/sample-data";

const assetStatusValues = [
  "ACTIVE",
  "STORED",
  "REPAIR_NEEDED",
  "RETIRED",
  "DISPOSED",
] as const;

type AssetStatusValue = (typeof assetStatusValues)[number];

export type AssetActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

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

function getStatusValue(value: string): AssetStatusValue | null {
  return assetStatusValues.find((status) => status === value.trim().toUpperCase()) ?? null;
}

async function getCurrentHomeId() {
  const db = getDb();
  const home = await db.home.findFirst({
    where: { name: sampleHome.name },
    select: { id: true },
  });

  return home?.id ?? null;
}

async function getRoomId(homeId: string, roomName: string) {
  if (!roomName) return null;

  const room = await getDb().room.findFirst({
    where: {
      homeId,
      name: { equals: roomName, mode: "insensitive" },
    },
    select: { id: true },
  });

  return room?.id ?? null;
}

async function getCategoryId(homeId: string, categoryName: string) {
  if (!categoryName) return null;

  const category = await getDb().assetCategory.findFirst({
    where: {
      homeId,
      name: { equals: categoryName, mode: "insensitive" },
    },
    select: { id: true },
  });

  return category?.id ?? null;
}

function getLinkWarning(
  roomName: string,
  roomId: string | null,
  categoryName: string,
  categoryId: string | null,
) {
  const missingLinks = [
    roomName && !roomId ? "room" : null,
    categoryName && !categoryId ? "category" : null,
  ].filter((value): value is string => Boolean(value));

  if (missingLinks.length === 0) return null;

  return `The selected ${missingLinks.join(" and ")} could not be matched, so ${
    missingLinks.length === 1 ? "it was" : "they were"
  } left unlinked.`;
}

function unavailableState(): AssetActionState {
  return {
    status: "error",
    message: "Saving needs a configured database. The page is still safe to review, but no asset was changed.",
  };
}

function unknownFailureState(): AssetActionState {
  return {
    status: "error",
    message: "HomeVault could not save this asset. Nothing was changed. Please try again after the database is available.",
  };
}

function getAssetValues(formData: FormData) {
  return {
    name: getFieldValue(formData, "name"),
    brand: getFieldValue(formData, "brand"),
    model: getFieldValue(formData, "model"),
    serialNumber: getFieldValue(formData, "serialNumber"),
    roomName: getFieldValue(formData, "room"),
    categoryName: getFieldValue(formData, "category"),
    purchaseDate: getDateValue(getFieldValue(formData, "purchaseDate")),
    purchasePlace: getFieldValue(formData, "purchasePlace"),
    status: getStatusValue(getFieldValue(formData, "status")),
    notes: getFieldValue(formData, "notes"),
  };
}

function invalidAssetState(values: ReturnType<typeof getAssetValues>): AssetActionState | null {
  if (!values.name) {
    return { status: "error", message: "Add an asset name before saving." };
  }

  if (!values.status) {
    return { status: "error", message: "Choose a recognised asset status before saving." };
  }

  if (values.purchaseDate === undefined) {
    return {
      status: "error",
      message: "Use a readable purchase date, such as 2024-03-14. Nothing was changed.",
    };
  }

  return null;
}

export async function createAssetAction(
  _previousState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const values = getAssetValues(formData);
  const invalidState = invalidAssetState(values);
  if (invalidState) return invalidState;

  const status = values.status;
  if (!status) return unknownFailureState();

  if (!process.env.DATABASE_URL) {
    return unavailableState();
  }

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();

    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving assets.",
      };
    }

    const [roomId, categoryId] = await Promise.all([
      getRoomId(homeId, values.roomName),
      getCategoryId(homeId, values.categoryName),
    ]);
    const linkWarning = getLinkWarning(
      values.roomName,
      roomId,
      values.categoryName,
      categoryId,
    );

    await db.asset.create({
      data: {
        homeId,
        roomId,
        categoryId,
        name: values.name,
        brand: values.brand || null,
        model: values.model || null,
        serialNumber: values.serialNumber || null,
        purchaseDate: values.purchaseDate,
        purchasePlace: values.purchasePlace || null,
        status,
        notes: values.notes || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/vault");
    revalidatePath("/vault/assets");
    revalidatePath("/vault/rooms");

    return {
      status: "success",
      message: linkWarning
        ? `Asset saved. ${linkWarning}`
        : "Asset saved. You can now find it in the assets list.",
    };
  } catch {
    return unknownFailureState();
  }
}

export async function updateAssetAction(
  assetId: string,
  _previousState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const values = getAssetValues(formData);
  const invalidState = invalidAssetState(values);
  if (invalidState) return invalidState;

  const status = values.status;
  if (!status) return unknownFailureState();

  if (!process.env.DATABASE_URL) {
    return unavailableState();
  }

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();

    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving assets.",
      };
    }

    const asset = await db.asset.findFirst({
      where: { id: assetId, homeId },
      select: { id: true },
    });

    if (!asset) {
      return {
        status: "error",
        message: "This asset was not found in the configured database. Nothing was changed.",
      };
    }

    const [roomId, categoryId] = await Promise.all([
      getRoomId(homeId, values.roomName),
      getCategoryId(homeId, values.categoryName),
    ]);
    const linkWarning = getLinkWarning(
      values.roomName,
      roomId,
      values.categoryName,
      categoryId,
    );

    await db.asset.update({
      where: { id: assetId },
      data: {
        roomId,
        categoryId,
        name: values.name,
        brand: values.brand || null,
        model: values.model || null,
        serialNumber: values.serialNumber || null,
        purchaseDate: values.purchaseDate,
        purchasePlace: values.purchasePlace || null,
        status,
        notes: values.notes || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/vault");
    revalidatePath("/vault/assets");
    revalidatePath(`/vault/assets/${assetId}`);
    revalidatePath(`/vault/assets/${assetId}/edit`);
    revalidatePath("/vault/rooms");

    return {
      status: "success",
      message: linkWarning
        ? `Asset updated. ${linkWarning}`
        : "Asset updated. The assets list now reflects this change.",
    };
  } catch {
    return unknownFailureState();
  }
}
