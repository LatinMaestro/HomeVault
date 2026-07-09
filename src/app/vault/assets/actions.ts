"use server";

import { revalidatePath } from "next/cache";

import { getDb } from "@/lib/db";
import { sampleHome } from "@/lib/sample-data";

export type AssetActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
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
    roomName: getFieldValue(formData, "room"),
    notes: getFieldValue(formData, "notes"),
  };
}

export async function createAssetAction(
  _previousState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const values = getAssetValues(formData);

  if (!values.name) {
    return { status: "error", message: "Add an asset name before saving." };
  }

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

    const roomId = await getRoomId(homeId, values.roomName);

    await db.asset.create({
      data: {
        homeId,
        roomId,
        name: values.name,
        brand: values.brand || null,
        model: values.model || null,
        notes: values.notes || null,
      },
    });

    revalidatePath("/vault");
    revalidatePath("/vault/assets");
    revalidatePath("/vault/rooms");

    return {
      status: "success",
      message: values.roomName && !roomId
        ? "Asset saved. The room name did not match an existing room, so it was left unlinked."
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

  if (!values.name) {
    return { status: "error", message: "Add an asset name before saving." };
  }

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

    const roomId = await getRoomId(homeId, values.roomName);

    await db.asset.update({
      where: { id: assetId },
      data: {
        roomId,
        name: values.name,
        brand: values.brand || null,
        model: values.model || null,
        notes: values.notes || null,
      },
    });

    revalidatePath("/vault");
    revalidatePath("/vault/assets");
    revalidatePath(`/vault/assets/${assetId}`);
    revalidatePath(`/vault/assets/${assetId}/edit`);
    revalidatePath("/vault/rooms");

    return {
      status: "success",
      message: values.roomName && !roomId
        ? "Asset updated. The room name did not match an existing room, so it was left unlinked."
        : "Asset updated. The assets list now reflects this change.",
    };
  } catch {
    return unknownFailureState();
  }
}
