"use server";

import { headers } from "next/headers";

import {
  OwnershipTransferRequiredError,
  deleteVerifiedAccount,
} from "@/lib/account-deletion";
import { getCurrentVerifiedSessionUser } from "@/lib/household-access";

export type DeleteAccountActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function deleteAccountAction(
  _previousState: DeleteAccountActionState,
  formData: FormData,
): Promise<DeleteAccountActionState> {
  const confirmation = formData.get("confirmation");
  if (confirmation !== "DELETE") {
    return {
      status: "error",
      message: "Type DELETE exactly to confirm permanent account deletion.",
    };
  }

  const passwordValue = formData.get("password");
  const password = typeof passwordValue === "string" ? passwordValue : "";
  if (!password) {
    return {
      status: "error",
      message: "Enter your current password to confirm account deletion.",
    };
  }

  const user = await getCurrentVerifiedSessionUser();
  if (!user) {
    return {
      status: "error",
      message: "Your verified session is unavailable. Sign in again before deleting the account.",
    };
  }

  try {
    const [{ auth }, requestHeaders] = await Promise.all([
      import("@/lib/auth"),
      headers(),
    ]);
    await auth.api.verifyPassword({
      body: { password },
      headers: requestHeaders,
    });
  } catch {
    return {
      status: "error",
      message: "The current password was not accepted. Nothing was deleted.",
    };
  }

  try {
    const result = await deleteVerifiedAccount(user.id);
    return {
      status: "success",
      message: result.attachmentCleanupFailed
        ? "Your account and household records were deleted. One or more private files need storage cleanup by HomeVault support."
        : "Your HomeVault account, eligible household data and private files were deleted.",
    };
  } catch (error) {
    if (error instanceof OwnershipTransferRequiredError) {
      return {
        status: "error",
        message: "Transfer household ownership before deleting this account.",
      };
    }

    return {
      status: "error",
      message: "HomeVault could not delete the account. No partial deletion was kept. Please try again.",
    };
  }
}
