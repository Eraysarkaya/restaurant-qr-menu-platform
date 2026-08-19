import { describe, expect, it } from "vitest";
import { buildMenuUrl, qrFileName } from "@/lib/qr";

describe("kalıcı QR menü hedefi", () => {
  it("domainin yalnız /menu rotasına yönelmesini sağlar", () => {
    expect(buildMenuUrl("https://restoran.example/eski?x=1#alan")).toBe("https://restoran.example/menu");
    expect(buildMenuUrl("http://localhost:3000")).toBe("http://localhost:3000/menu");
  });

  it("işletme adından güvenli indirme adı üretir", () => {
    expect(qrFileName("Köşe Mutfak", "png")).toBe("kose-mutfak-menu-qr.png");
  });
});
