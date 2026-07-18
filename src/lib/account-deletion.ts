import { deletePrivateAttachments } from "@/lib/attachment-storage";
import { getAuthDb } from "@/lib/db";

export class OwnershipTransferRequiredError extends Error {
  constructor() {
    super("Household ownership must be transferred before this account can be deleted.");
    this.name = "OwnershipTransferRequiredError";
  }
}

export type MembershipDeletionSummary = {
  id: string;
  homeId: string;
  role: "OWNER" | "ADULT" | "CHILD" | "GUEST";
  memberCount: number;
};

export function getMembershipDeletionPlan(memberships: MembershipDeletionSummary[]) {
  if (memberships.some((membership) => membership.role === "OWNER" && membership.memberCount > 1)) {
    throw new OwnershipTransferRequiredError();
  }

  return {
    homeIds: memberships
      .filter((membership) => membership.memberCount === 1)
      .map((membership) => membership.homeId),
    membershipIds: memberships
      .filter((membership) => membership.memberCount > 1)
      .map((membership) => membership.id),
  };
}

export type AccountDeletionResult = {
  deletedHomeCount: number;
  removedMembershipCount: number;
  attachmentCleanupFailed: boolean;
};

export async function deleteVerifiedAccount(userId: string): Promise<AccountDeletionResult> {
  const deletion = await getAuthDb().$transaction(async (transaction) => {
    const memberships = await transaction.householdMember.findMany({
      where: { userId },
      include: {
        home: {
          select: {
            _count: { select: { members: true } },
          },
        },
      },
    });

    const plan = getMembershipDeletionPlan(
      memberships.map((membership) => ({
        id: membership.id,
        homeId: membership.homeId,
        role: membership.role,
        memberCount: membership.home._count.members,
      })),
    );

    const attachments =
      plan.homeIds.length > 0
        ? await transaction.document.findMany({
            where: {
              homeId: { in: plan.homeIds },
              storageKey: { not: null },
            },
            select: { storageKey: true },
          })
        : [];

    for (const homeId of plan.homeIds) {
      await transaction.home.delete({ where: { id: homeId } });
    }
    for (const membershipId of plan.membershipIds) {
      await transaction.householdMember.delete({ where: { id: membershipId } });
    }

    await transaction.user.delete({ where: { id: userId } });

    return {
      deletedHomeCount: plan.homeIds.length,
      removedMembershipCount: plan.membershipIds.length,
      storageKeys: attachments.flatMap((attachment) =>
        attachment.storageKey ? [attachment.storageKey] : [],
      ),
    };
  });

  const attachmentsRemoved = await deletePrivateAttachments(deletion.storageKeys);
  return {
    deletedHomeCount: deletion.deletedHomeCount,
    removedMembershipCount: deletion.removedMembershipCount,
    attachmentCleanupFailed: !attachmentsRemoved,
  };
}
