import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "sam.taylor@example.test" },
    update: {},
    create: {
      email: "sam.taylor@example.test",
      name: "Sam Taylor",
    },
  });

  const existingHome = await prisma.home.findFirst({
    where: {
      name: "Taylor Family Home",
      members: { some: { userId: user.id } },
    },
    select: { id: true },
  });

  if (existingHome) {
    console.log("Taylor Family Home seed data already exists; no duplicate home was created.");
    return;
  }

  const home = await prisma.home.create({
    data: {
      name: "Taylor Family Home",
      suburb: "Carindale",
      state: "QLD",
      postcode: "4152",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
          nickname: "Sam",
        },
      },
      rooms: {
        create: [
          { name: "Kitchen" },
          { name: "Laundry" },
          { name: "Garage" },
          { name: "Backyard" },
        ],
      },
      assetCategories: {
        create: [
          { name: "Appliances", description: "Kitchen and laundry appliances" },
          { name: "Outdoor Equipment", description: "Garden and backyard equipment" },
          { name: "Tools", description: "Garage and workshop tools" },
        ],
      },
      serviceProviders: {
        create: [
          {
            name: "Brisbane Home Electrical",
            trade: "Electrician",
            phone: "07 3000 0000",
            notes: "Sample local service provider for seed data.",
          },
          {
            name: "Southside Appliance Care",
            trade: "Appliance repair",
            phone: "07 3000 1111",
          },
        ],
      },
    },
    include: {
      rooms: true,
      assetCategories: true,
      serviceProviders: true,
    },
  });

  const roomByName = Object.fromEntries(home.rooms.map((room) => [room.name, room]));
  const categoryByName = Object.fromEntries(
    home.assetCategories.map((category) => [category.name, category]),
  );
  const providerByName = Object.fromEntries(
    home.serviceProviders.map((provider) => [provider.name, provider]),
  );

  const fridge = await prisma.asset.create({
    data: {
      homeId: home.id,
      roomId: roomByName.Kitchen.id,
      categoryId: categoryByName.Appliances.id,
      name: "French door fridge",
      brand: "Fisher & Paykel",
      model: "RF605QDUVX1",
      purchaseDate: new Date("2024-03-14"),
      purchasePlace: "The Good Guys Mount Gravatt",
      warranties: {
        create: {
          homeId: home.id,
          provider: "Fisher & Paykel",
          startsAt: new Date("2024-03-14"),
          expiresAt: new Date("2026-03-14"),
          notes: "Sample manufacturer warranty.",
        },
      },
      receipts: {
        create: {
          homeId: home.id,
          merchant: "The Good Guys Mount Gravatt",
          purchaseDate: new Date("2024-03-14"),
          totalAmountCents: 289900,
          currency: "AUD",
        },
      },
      documents: {
        create: {
          homeId: home.id,
          title: "Fridge manual",
          type: "MANUAL",
          fileName: "fisher-paykel-fridge-manual.pdf",
          notes: "Metadata only; no file storage is connected in Phase 1B.",
        },
      },
    },
  });

  const mower = await prisma.asset.create({
    data: {
      homeId: home.id,
      roomId: roomByName.Garage.id,
      categoryId: categoryByName["Outdoor Equipment"].id,
      name: "Battery lawn mower",
      brand: "Ryobi",
      purchaseDate: new Date("2023-09-02"),
      purchasePlace: "Bunnings Cannon Hill",
      receipts: {
        create: {
          homeId: home.id,
          merchant: "Bunnings Cannon Hill",
          purchaseDate: new Date("2023-09-02"),
          totalAmountCents: 64900,
          currency: "AUD",
        },
      },
    },
  });

  const acTask = await prisma.maintenanceTask.create({
    data: {
      homeId: home.id,
      title: "Clean air conditioner filters",
      description: "Rinse and dry split-system filters before reinstalling.",
      frequency: "QUARTERLY",
      nextDueDate: new Date("2026-09-01"),
      serviceProviderId: providerByName["Brisbane Home Electrical"].id,
      reminders: {
        create: {
          homeId: home.id,
          title: "Air conditioner filter clean due",
          dueAt: new Date("2026-09-01"),
        },
      },
    },
  });

  await prisma.maintenanceTask.create({
    data: {
      homeId: home.id,
      assetId: mower.id,
      title: "Service lawn mower",
      description: "Check blades, battery contacts and mower deck.",
      frequency: "SIX_MONTHLY",
      nextDueDate: new Date("2026-10-15"),
      completions: {
        create: {
          assetId: mower.id,
          completedAt: new Date("2026-04-15"),
          completedBy: "Sam",
          notes: "Cleaned deck and checked blade condition.",
        },
      },
    },
  });

  await prisma.document.create({
    data: {
      homeId: home.id,
      maintenanceTaskId: acTask.id,
      title: "Air conditioner service note",
      type: "SERVICE_RECORD",
      notes: "Sample service record metadata.",
      issuedAt: new Date("2026-03-01"),
    },
  });

  await prisma.reminder.create({
    data: {
      homeId: home.id,
      assetId: fridge.id,
      title: "Review fridge warranty",
      dueAt: new Date("2026-02-14"),
      notes: "Check warranty before expiry.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
