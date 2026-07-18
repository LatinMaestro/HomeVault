"use server";

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

  const user = await getCurrentVerifiedSessionUser();
  if (!user) {
    return {
      status: "error",
      message: "Your verified session is unavailable. Sign in again before deleting the account.",
    };
  }

  try {
    await deleteVerifiedAccount(user.id);
    return {
      status: "success",
      message: "Your HomeVault account and eligible household data were deleted.",
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
