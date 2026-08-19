import { afterAll, describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/server/db/client";

const db = getDb();
const categoryId = "integration-category";
const productId = "integration-product";

describe("PostgreSQL ürün/kategori entegrasyonu", () => {
  afterAll(async () => {
    await db.auditLog.deleteMany({ where: { entityId: "integration-audit" } });
    await db.product.deleteMany({ where: { id: productId } });
    await db.category.deleteMany({ where: { id: categoryId } });
    await db.restaurantSettings.update({ where: { id: "singleton" }, data: { showPhoneCta: true } });
    await db.openingHour.update({ where: { settingsId_dayOfWeek: { settingsId: "singleton", dayOfWeek: 0 } }, data: { isClosed: false, openTime: "09:00", closeTime: "23:00" } });
  });

  it("Decimal fiyatlı ürün oluşturur ve kategori silmeyi RESTRICT ile engeller", async () => {
    await db.category.upsert({
      where: { id: categoryId },
      update: {},
      create: { id: categoryId, name: "Entegrasyon", slug: "entegrasyon", sortOrder: 9999 },
    });
    const product = await db.product.upsert({
      where: { id: productId },
      update: { price: new Prisma.Decimal("249.90") },
      create: { id: productId, name: "Test Ürünü", slug: "test-urunu-integration", description: "Entegrasyon testinde kullanılan kontrollü ürün.", price: new Prisma.Decimal("249.90"), categoryId },
    });
    expect(product.price.toFixed(2)).toBe("249.90");
    await expect(db.category.delete({ where: { id: categoryId } })).rejects.toThrow();
  });

  it("ayar ve gece yarısını aşan çalışma saatini günceller", async () => {
    const settings = await db.restaurantSettings.update({ where: { id: "singleton" }, data: { showPhoneCta: false } });
    expect(settings.showPhoneCta).toBe(false);
    const hour = await db.openingHour.upsert({
      where: { settingsId_dayOfWeek: { settingsId: "singleton", dayOfWeek: 0 } },
      update: { isClosed: false, openTime: "18:00", closeTime: "02:00" },
      create: { settingsId: "singleton", dayOfWeek: 0, isClosed: false, openTime: "18:00", closeTime: "02:00" },
    });
    expect(hour.closeTime).toBe("02:00");
  });

  it("ürün düzenleme ve arşivleme işlemlerini tekil kayıt üzerinde uygular", async () => {
    const updated = await db.product.update({ where: { id: productId }, data: { name: "Güncellenmiş Test Ürünü", isAvailable: false } });
    expect(updated).toMatchObject({ name: "Güncellenmiş Test Ürünü", isAvailable: false });
    const archived = await db.product.update({ where: { id: productId }, data: { archivedAt: new Date(), isActive: false } });
    expect(archived.archivedAt).toBeInstanceOf(Date);
    expect(await db.product.count({ where: { id: productId, archivedAt: null } })).toBe(0);
  });

  it("aktif sorgu indekslerini korur ve eski sipariş tablolarını içermez", async () => {
    const indexes = await db.$queryRaw<Array<{ indexname: string }>>`SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('Category', 'Product')`;
    expect(indexes.map((row) => row.indexname)).toEqual(expect.arrayContaining(["Category_isActive_archivedAt_sortOrder_idx", "Product_categoryId_isActive_archivedAt_sortOrder_idx"]));
    const retired = await db.$queryRaw<Array<{ table_name: string }>>`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('Order', 'Payment', 'DiningTable', 'KitchenStation')`;
    expect(retired).toEqual([]);
  });

  it("yönetim denetim kaydını zaman damgası ve indekslenen hedefle saklar", async () => {
    const audit = await db.auditLog.create({
      data: { action: "PRODUCT_UPDATE", entityType: "Product", entityId: "integration-audit" },
    });
    expect(audit.createdAt).toBeInstanceOf(Date);
    expect(audit.entityId).toBe("integration-audit");
  });
});
