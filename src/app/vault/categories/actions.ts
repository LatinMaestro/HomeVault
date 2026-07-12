"use server";

import { revalidatePath } from "next/cache";

import { getCurrentHomeId } from "@/lib/current-home";
import { getDb } from "@/lib/db";

export type AssetCategoryActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function unavailableState(): AssetCategoryActionState {
  return {
    status: "error",
    message: "Saving needs a configured database. The page is still safe to review, but no category was changed.",
  };
}

function unknownFailureState(): AssetCategoryActionState {
  return {
    status: "error",
    message: "HomeVault could not save this category. Nothing was changed. Please try again after the database is available.",
  };
}

function revalidateCategoryPaths(categoryId?: string) {
  revalidatePath("/vault");
  revalidatePath("/vault/assets");
  revalidatePath("/vault/categories");
  if (categoryId) revalidatePath(`/vault/categories/${categoryId}/edit`);
}

export async function createAssetCategoryAction(
  _previousState: AssetCategoryActionState,
  formData: FormData,
): Promise<AssetCategoryActionState> {
  const name = getFieldValue(formData, "name");
  const description = getFieldValue(formData, "description");
  if (!name) return { status: "error", message: "Add a category name before saving." };
  if (!process.env.DATABASE_URL) return unavailableState();

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();
    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving categories.",
      };
    }

    const duplicate = await db.assetCategory.findFirst({
      where: { homeId, name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplicate) {
      return { status: "error", message: "An asset category with this name already exists." };
    }

    const category = await db.assetCategory.create({
      data: { homeId, name, description: description || null },
      select: { id: true },
    });

    revalidateCategoryPaths(category.id);
    return { status: "success", message: "Asset category saved. It is now available on asset forms." };
  } catch {
    return unknownFailureState();
  }
}

export async function updateAssetCategoryAction(
  categoryId: string,
  _previousState: AssetCategoryActionState,
  formData: FormData,
): Promise<AssetCategoryActionState> {
  const name = getFieldValue(formData, "name");
  const description = getFieldValue(formData, "description");
  if (!name) return { status: "error", message: "Add a category name before saving." };
  if (!process.env.DATABASE_URL) return unavailableState();

  try {
    const db = getDb();
    const homeId = await getCurrentHomeId();
    if (!homeId) {
      return {
        status: "error",
        message: "The sample home could not be found in the database. Seed the database before saving categories.",
      };
    }

    const category = await db.assetCategory.findFirst({
      where: { id: categoryId, homeId },
      select: { id: true },
    });
    if (!category) {
      return {
        status: "error",
        message: "This category was not found in the configured database. Nothing was changed.",
      };
    }

    const duplicate = await db.assetCategory.findFirst({
      where: {
        homeId,
        name: { equals: name, mode: "insensitive" },
        id: { not: categoryId },
      },
      select: { id: true },
    });
    if (duplicate) {
      return { status: "error", message: "Another asset category already uses this name." };
    }

    await db.assetCategory.update({
      where: { id: categoryId },
      data: { name, description: description || null },
    });

    revalidateCategoryPaths(categoryId);
    return { status: "success", message: "Asset category updated. Asset forms now reflect this change." };
  } catch {
    return unknownFailureState();
  }
}
