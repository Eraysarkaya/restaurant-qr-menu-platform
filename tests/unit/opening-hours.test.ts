import { describe, expect, it } from "vitest";
import { getRestaurantStatus } from "@/lib/opening-hours";

const hours = [
  { dayOfWeek: 0, isClosed: false, openTime: "09:00", closeTime: "23:00" },
  { dayOfWeek: 1, isClosed: true, openTime: null, closeTime: null },
];

describe("açık/kapalı hesabı", () => {
  it("restoran timezone'una göre açık durumu verir", () => {
    const result = getRestaurantStatus(hours, "Europe/Istanbul", new Date("2026-08-03T08:00:00.000Z"));
    expect(result.isOpen).toBe(true);
    expect(result.label).toContain("23:00");
  });

  it("kapalı günü tanır", () => {
    expect(getRestaurantStatus(hours, "Europe/Istanbul", new Date("2026-08-04T08:00:00.000Z")).isOpen).toBe(false);
  });

  it("gece yarısını aşan önceki gün vardiyasını tanır", () => {
    const overnight = [{ dayOfWeek: 0, isClosed: false, openTime: "18:00", closeTime: "02:00" }];
    const result = getRestaurantStatus(overnight, "Europe/Istanbul", new Date("2026-08-03T22:30:00.000Z"));
    expect(result).toEqual({ isOpen: true, label: "Açık · 02:00'e kadar" });
  });
});
