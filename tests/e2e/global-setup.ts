import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

export default async function globalSetup() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !["localhost", "127.0.0.1"].includes(new URL(appUrl).hostname)) return;

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  await db.product.updateMany({
    where: { name: { startsWith: "E2E Burger " }, archivedAt: null },
    data: { archivedAt: new Date(), isActive: false, isAvailable: false },
  });
  await db.rateLimit.deleteMany();
  await db.restaurantSettings.update({ where: { id: "singleton" }, data: { address: "Caferağa Mah. Moda Cad. No: 24, Kadıköy / İstanbul", themePreset: "WARM", heroFocalX: 50, heroFocalY: 50 } });
  await db.$disconnect();
}
