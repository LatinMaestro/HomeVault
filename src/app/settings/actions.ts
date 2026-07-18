"use server";

import { revalidatePath } from "next/cache";

import { getCurrentHouseholdWriteContext } from "@/lib/household-access";

const australianStates = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] as const;

export type HouseholdProfileActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateHouseholdProfileAction(
  _previousState: HouseholdProfileActionState,
  formData: FormData,
): Promise<HouseholdProfileActionState> {
  const name = getFieldValue(formData, "name");
  const addressLine = getFieldValue(formData, "addressLine");
  const suburb = getFieldValue(formData, "suburb");
  const state = getFieldValue(formData, "state").toUpperCase();
  const postcode = getFieldValue(formData, "postcode");

  if (!name) return { status: "error", message: "Add a household name before saving." };
  if (state && !australianStates.some((value) => value === state)) {
    return { status: "error", message: "Choose a recognised Australian state or territory. Nothing was changed." };
  }
  if (postcode && !/^\d{4}$/.test(postcode)) {
    return { status: "error", message: "Use a four-digit Australian postcode or leave it blank. Nothing was changed." };
  }
  const context = await getCurrentHouseholdWriteContext();

  if (!context) {
    return {
      status: "error",
      message: "Saving is not enabled for this preview. The page is still safe to review, but no household details were changed.",
    };
  }

  try {
    const homeId = context.homeId;
    if (!homeId) {
      return {
        status: "error",
        message: "The current home could not be found in the database. Nothing was changed.",
      };
    }

    await context.db.home.update({
      where: { id: homeId },
      data: {
        name,
        addressLine: addressLine || null,
        suburb: suburb || null,
        state: state || null,
        postcode: postcode || null,
        country: "Australia",
      },
    });

    revalidatePath("/");
    revalidatePath("/settings");
    return { status: "success", message: "Household details updated." };
  } catch {
    return {
      status: "error",
      message: "HomeVault could not save these household details. Nothing was changed. Please try again after the database is available.",
    };
  }
}
