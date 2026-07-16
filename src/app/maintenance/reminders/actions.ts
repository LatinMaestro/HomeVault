"use server";

import { revalidatePath } from "next/cache";

import { getCurrentHomeId } from "@/lib/current-home";
import { getDb } from "@/lib/db";
import { getOptionalDateValue } from "@/lib/form-values";

const reminderStatuses = ["PENDING", "DONE", "SNOOZED", "CANCELLED"] as const;
type ReminderStatusValue = (typeof reminderStatuses)[number];

export type ReminderActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFieldValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getStatus(value: string): ReminderStatusValue | null {
  return reminderStatuses.find((status) => status === value.toUpperCase()) ?? null;
}

function getValues(formData: FormData) {
  return {
    title: getFieldValue(formData, "title"),
    dueAt: getOptionalDateValue(getFieldValue(formData, "dueAt")),
    status: getStatus(getFieldValue(formData, "status")),
    assetId: getFieldValue(formData, "assetId"),
    warrantyId: getFieldValue(formData, "warrantyId"),
    taskId: getFieldValue(formData, "taskId"),
    notes: getFieldValue(formData, "notes"),
  };
}

function invalidState(values: ReturnType<typeof getValues>): ReminderActionState | null {
  if (!values.title) return { status: "error", message: "Add a reminder title before saving." };
  if (!values.dueAt) {
    return {
      status: "error",
      message: "Choose a valid reminder due date. Nothing was changed.",
    };
  }
  if (!values.status) {
    return {
      status: "error",
      message: "Choose a recognised reminder status. Nothing was changed.",
    };
  }
  return null;
}

async function resolveLinks(
  homeId: string,
  assetId: string,
  warrantyId: string,
  taskId: string,
) {
  const db = getDb();
  const [asset, warranty, task] = await Promise.all([
    assetId
      ? db.asset.findFirst({ where: { id: assetId, homeId }, select: { id: true } })
      : null,
    warrantyId
      ? db.warranty.findFirst({ where: { id: warrantyId, homeId }, select: { id: true } })
      : null,
    taskId
      ? db.maintenanceTask.findFirst({ where: { id: taskId, homeId }, select: { id: true } })
      : null,
  ]);

  if ((assetId && !asset) || (warrantyId && !warranty) || (taskId && !task)) return null;
  return {
    assetId: asset?.id ?? null,
    warrantyId: warranty?.id ?? null,
    taskId: task?.id ?? null,
  };
}

function unavailableState(): ReminderActionState {
  return {
    status: "error",
    message: "Saving needs a configured database. The page is still safe to review, but no reminder was changed.",
  };
}

function revalidateReminderPaths(
  reminderId?: string,
  links?: { assetId: string | null; warrantyId: string | null; taskId: string | null },
) {
  revalidatePath("/");
  revalidatePath("/maintenance");
  revalidatePath("/maintenance/reminders");
  if (reminderId) {
    revalidatePath(`/maintenance/reminders/${reminderId}`);
    revalidatePath(`/maintenance/reminders/${reminderId}/edit`);
  }
  if (links?.assetId) revalidatePath(`/vault/assets/${links.assetId}`);
  if (links?.warrantyId) revalidatePath(`/warranties/${links.warrantyId}`);
  if (links?.taskId) revalidatePath(`/maintenance/${links.taskId}`);
}

export async function createReminderAction(
  _previousState: ReminderActionState,
  formData: FormData,
): Promise<ReminderActionState> {
  const values = getValues(formData);
  const invalid = invalidState(values);
  if (invalid || !values.dueAt || !values.status) return invalid ?? unavailableState();
  if (!process.env.DATABASE_URL) return unavailableState();

  try {
    const homeId = await getCurrentHomeId();
    if (!homeId) {
      return { status: "error", message: "The current home was not found. Nothing was changed." };
    }

    const links = await resolveLinks(homeId, values.assetId, values.warrantyId, values.taskId);
    if (!links) {
      return {
        status: "error",
        message: "One of the linked records is not available in this home. Nothing was changed.",
      };
    }

    const reminder = await getDb().reminder.create({
      data: {
        homeId,
        ...links,
        title: values.title,
        dueAt: values.dueAt,
        status: values.status,
        notes: values.notes || null,
      },
      select: { id: true },
    });

    revalidateReminderPaths(reminder.id, links);
    return {
      status: "success",
      message: "Reminder saved as metadata only. No notification was scheduled or sent.",
    };
  } catch {
    return {
      status: "error",
      message: "HomeVault could not save this reminder. Nothing was changed.",
    };
  }
}

export async function updateReminderAction(
  reminderId: string,
  _previousState: ReminderActionState,
  formData: FormData,
): Promise<ReminderActionState> {
  const values = getValues(formData);
  const invalid = invalidState(values);
  if (invalid || !values.dueAt || !values.status) return invalid ?? unavailableState();
  if (!process.env.DATABASE_URL) return unavailableState();

  try {
    const homeId = await getCurrentHomeId();
    if (!homeId) {
      return { status: "error", message: "The current home was not found. Nothing was changed." };
    }

    const existing = await getDb().reminder.findFirst({
      where: { id: reminderId, homeId },
      select: { id: true, assetId: true, warrantyId: true, taskId: true },
    });
    if (!existing) {
      return {
        status: "error",
        message: "This reminder was not found in the configured database. Nothing was changed.",
      };
    }

    const links = await resolveLinks(homeId, values.assetId, values.warrantyId, values.taskId);
    if (!links) {
      return {
        status: "error",
        message: "One of the linked records is not available in this home. Nothing was changed.",
      };
    }

    await getDb().reminder.update({
      where: { id: reminderId },
      data: {
        ...links,
        title: values.title,
        dueAt: values.dueAt,
        status: values.status,
        notes: values.notes || null,
      },
    });

    revalidateReminderPaths(reminderId, existing);
    revalidateReminderPaths(reminderId, links);
    return {
      status: "success",
      message: "Reminder updated. No notification was scheduled or sent.",
    };
  } catch {
    return {
      status: "error",
      message: "HomeVault could not update this reminder. Nothing was changed.",
    };
  }
}
