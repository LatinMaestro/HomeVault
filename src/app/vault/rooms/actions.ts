"use server";

import { revalidatePath } from "next/cache";

import { getCurrentHomeId } from "@/lib/current-home";
import { getDb, isPreviewDatabaseEnabled } from "@/lib/db";

export type RoomActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function unavailableState(): RoomActionState {
  return {
    status: "error",
    message: "Saving is not enabled for this preview. The page is still safe to review, but no room was changed.",
  };
}

function unknownFailureState(): RoomActionState {
  return {
    status: "error",
    message: "HomeVault could not save this room. Nothing was changed. Please try again after the database is available.",
  };
}

export async function createRoomAction(
  _previousState: RoomActionState,
  formData: FormData,
): Promise<RoomActionState> {
  const name = getFieldValue(formData, "name");
  const floor = getFieldValue(formData, "floor");
  const notes = getFieldValue(formData, "notes");

  if (!name) {
    return { status: "error", message: "Add a room name before saving." };
  }

  if (!isPreviewDatabaseEnabled()) {
    return unavailableState();
  }

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();

    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving rooms.",
      };
    }

    const existingRoom = await db.room.findFirst({
      where: { homeId, name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });

    if (existingRoom) {
      return { status: "error", message: "A room with this name already exists." };
    }

    await db.room.create({
      data: {
        homeId,
        name,
        floor: floor || null,
        notes: notes || null,
      },
    });

    revalidatePath("/vault");
    revalidatePath("/vault/rooms");

    return { status: "success", message: "Room saved. You can now find it in the rooms list." };
  } catch {
    return unknownFailureState();
  }
}

export async function updateRoomAction(
  roomId: string,
  _previousState: RoomActionState,
  formData: FormData,
): Promise<RoomActionState> {
  const name = getFieldValue(formData, "name");
  const floor = getFieldValue(formData, "floor");
  const notes = getFieldValue(formData, "notes");

  if (!name) {
    return { status: "error", message: "Add a room name before saving." };
  }

  if (!isPreviewDatabaseEnabled()) {
    return unavailableState();
  }

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();

    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving rooms.",
      };
    }

    const room = await db.room.findFirst({
      where: { id: roomId, homeId },
      select: { id: true },
    });

    if (!room) {
      return {
        status: "error",
        message: "This room was not found in the configured database. Nothing was changed.",
      };
    }

    const duplicateRoom = await db.room.findFirst({
      where: {
        homeId,
        name: { equals: name, mode: "insensitive" },
        id: { not: roomId },
      },
      select: { id: true },
    });

    if (duplicateRoom) {
      return { status: "error", message: "Another room already uses this name." };
    }

    await db.room.update({
      where: { id: roomId },
      data: {
        name,
        floor: floor || null,
        notes: notes || null,
      },
    });

    revalidatePath("/vault");
    revalidatePath("/vault/rooms");
    revalidatePath(`/vault/rooms/${roomId}/edit`);

    return { status: "success", message: "Room updated. The rooms list now reflects this change." };
  } catch {
    return unknownFailureState();
  }
}
