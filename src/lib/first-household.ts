import { getAuthDb } from "@/lib/db";

export type FirstHouseholdInput = {
  userId: string;
  userName: string;
  name: string;
  addressLine?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
};

export type FirstHouseholdResult = {
  homeId: string;
  created: boolean;
};

export function getFirstHouseholdId(userId: string) {
  return `home-${userId}`;
}

export async function createFirstHousehold(
  input: FirstHouseholdInput,
): Promise<FirstHouseholdResult> {
  const db = getAuthDb();
  const existing = await db.householdMember.findFirst({
    where: { userId: input.userId },
    orderBy: { createdAt: "asc" },
    select: { homeId: true },
  });

  if (existing) {
    return { homeId: existing.homeId, created: false };
  }

  const homeId = getFirstHouseholdId(input.userId);

  try {
    const home = await db.$transaction(async (transaction) => {
      return transaction.home.create({
        data: {
          id: homeId,
          name: input.name,
          addressLine: input.addressLine || null,
          suburb: input.suburb || null,
          state: input.state || null,
          postcode: input.postcode || null,
          country: "Australia",
          members: {
            create: {
              userId: input.userId,
              role: "OWNER",
              nickname: input.userName,
            },
          },
        },
        select: { id: true },
      });
    });

    return { homeId: home.id, created: true };
  } catch (error) {
    const racedMembership = await db.householdMember.findFirst({
      where: { userId: input.userId },
      orderBy: { createdAt: "asc" },
      select: { homeId: true },
    });

    if (racedMembership) {
      return { homeId: racedMembership.homeId, created: false };
    }

    throw error;
  }
}
