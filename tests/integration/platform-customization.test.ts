import { describe, expect, it } from "vitest";
import { syncLocalInstanceSettings } from "@/platform/instances/service";
import { getDb } from "@/server/db/client";

const db = getDb();

describe("geliştirici görünümünün siteye uygulanması", () => {
  it("şablon, font, renk, logo ve kapak seçimini aynı transaction içinde public ayarlara taşır", async () => {
    const original = await db.restaurantInstance.findFirstOrThrow({ where: { deploymentProjectId: "local" } });
    try {
      await db.$transaction(async (transaction) => {
        const changed = await transaction.restaurantInstance.update({ where: { id: original.id }, data: {
          templatePreset: "MODERN", fontPreset: "MANROPE", primaryColor: "#7A2E1F", accentColor: "#355E3B",
          heroImageUrl: "/demo/burger.png", heroFocalX: 100, heroFocalY: 50,
        } });
        await syncLocalInstanceSettings(transaction, changed);
      });
      const publicSettings = await db.restaurantSettings.findUniqueOrThrow({ where: { id: "singleton" } });
      expect(publicSettings).toMatchObject({ themePreset: "MODERN", fontPreset: "MANROPE", primaryColor: "#7A2E1F", accentColor: "#355E3B", heroImageUrl: "/demo/burger.png", heroFocalX: 100, heroFocalY: 50 });
    } finally {
      await db.$transaction(async (transaction) => {
        const restored = await transaction.restaurantInstance.update({ where: { id: original.id }, data: { templatePreset: original.templatePreset, fontPreset: original.fontPreset, primaryColor: original.primaryColor, accentColor: original.accentColor, heroImageUrl: original.heroImageUrl, heroFocalX: original.heroFocalX, heroFocalY: original.heroFocalY } });
        await syncLocalInstanceSettings(transaction, restored);
      });
    }
  });
});
