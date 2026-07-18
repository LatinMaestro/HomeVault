import { getAuthDb } from "@/lib/db";

export class OwnershipTransferRequiredError extends Error {
  constructor() {
    super("Household ownership must be transferred before this account can be deleted.");
    this.name = "OwnershipTransferRequiredError";
  }
}

export type AccountDeletionResult = {
  deletedHomeCount: number;
  removedMembershipCount: number;
};

export async function deleteVerifiedAccount(userId: string): Promise<AccountDeletionResult> {
  return getAuthDb().$transaction(async (transaction) => {
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

    const blockedOwnership = memberships.some(
      (membership) => membership.role === "OWNER" && membership.home._count.members > 1,
    );
    if (blockedOwnership) throw new OwnershipTransferRequiredError();

    let deletedHomeCount = 0;
    let removedMembershipCount = 0;

    for (const membership of memberships) {
      if (membership.home._count.members === 1) {
        await transaction.home.delete({ where: { id: membership.homeId } });
        deletedHomeCount += 1;
      } else {
        await transaction.householdMember.delete({ where: { id: membership.id } });
        removedMembershipCount += 1;
      }
    }

    await transaction.user.delete({ where: { id: userId } });

    return { deletedHomeCount, removedMembershipCount };
  });
}
