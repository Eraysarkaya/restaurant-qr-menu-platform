"use server";

import "server-only";
import { hashPassword } from "better-auth/crypto";
import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { recordAuditEvent } from "@/server/audit";
import { requireAdminAction } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { deleteImage, uploadImage, type UploadedImage } from "@/server/media/cloudinary";
import { slugifyTurkish } from "@/lib/format";
import type { ActionState } from "@/lib/action-state";
import {
  categorySchema,
  entityActionSchema,
  moveCategorySchema,
  openingHourSchema,
  productSchema,
  profileSchema,
  settingsSchema,
  toggleAvailabilitySchema,
} from "@/validations/schemas";

function fields(error: { flatten(): { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

function bool(data: FormData, key: string) {
  return data.get(key) === "on" || data.get(key) === "true";
}

function fileFrom(data: FormData, key: string) {
  const value = data.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function refreshPublic(tags: string[]) {
  for (const tag of tags) updateTag(tag);
  revalidatePath("/", "layout");
  revalidatePath("/menu", "page");
  revalidatePath("/sitemap.xml", "page");
}

export async function saveCategoryAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireAdminAction("MENU_MANAGE");
    const parsed = categorySchema.safeParse({
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      description: formData.get("description"),
      sortOrder: formData.get("sortOrder") || 0,
      isActive: bool(formData, "isActive"),
      removeImage: bool(formData, "removeImage"),
    });
    if (!parsed.success) return { ok: false, message: "Kategori bilgilerini kontrol edin.", fieldErrors: fields(parsed.error) };

    const db = getDb();
    const existing = parsed.data.id ? await db.category.findUnique({ where: { id: parsed.data.id } }) : null;
    if (parsed.data.id && !existing) return { ok: false, message: "Düzenlenmek istenen kategori bulunamadı." };
    const imageFile = fileFrom(formData, "image");
    let uploaded: UploadedImage | null = null;
    let savedId = existing?.id;
    try {
      if (imageFile) uploaded = await uploadImage(imageFile, "categories");
      const imageUrl = parsed.data.removeImage ? null : uploaded?.url ?? existing?.imageUrl ?? null;
      const imagePublicId = parsed.data.removeImage ? null : uploaded?.publicId ?? existing?.imagePublicId ?? null;
      const data = {
        name: parsed.data.name,
        slug: slugifyTurkish(parsed.data.name),
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        imageUrl,
        imagePublicId,
      };
      const saved = existing
        ? await db.category.update({ where: { id: existing.id }, data })
        : await db.category.create({ data });
      savedId = saved.id;
    } catch (error) {
      if (uploaded) await deleteImage(uploaded.publicId).catch(() => undefined);
      throw error;
    }
    if ((uploaded || parsed.data.removeImage) && existing?.imagePublicId) await deleteImage(existing.imagePublicId).catch(() => undefined);
    await recordAuditEvent(session, existing ? "CATEGORY_UPDATE" : "CATEGORY_CREATE", "Category", savedId);
    refreshPublic(["categories"]);
    revalidatePath("/admin/categories");
    return { ok: true, message: existing ? "Kategori güncellendi." : "Kategori eklendi." };
  } catch (error) {
    return { ok: false, message: error instanceof Error && error.message.includes("Görsel") ? error.message : "Kategori kaydedilemedi. Aynı adlı bir kategori zaten bulunuyor olabilir." };
  }
}

export async function deleteCategoryAction(formData: FormData) {
  const session = await requireAdminAction("MENU_MANAGE");
  const input = entityActionSchema.safeParse({ id: formData.get("id") });
  if (!input.success) return;
  const id = input.data.id;
  const db = getDb();
  const category = await db.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!category) return;
  if (category._count.products > 0) redirect("/admin/categories?error=not-empty");
  await db.category.update({ where: { id }, data: { archivedAt: new Date(), isActive: false } });
  await recordAuditEvent(session, "CATEGORY_DELETE", "Category", category.id);
  refreshPublic(["categories"]);
  redirect("/admin/categories?success=deleted");
}

export async function moveCategoryAction(formData: FormData) {
  const session = await requireAdminAction("MENU_MANAGE");
  const input = moveCategorySchema.safeParse({ id: formData.get("id"), direction: formData.get("direction") });
  if (!input.success) return;
  const id = input.data.id;
  const direction = input.data.direction === "up" ? -1 : 1;
  const db = getDb();
  const current = await db.category.findUnique({ where: { id } });
  if (!current) return;
  const neighbor = await db.category.findFirst({
    where: direction < 0 ? { sortOrder: { lt: current.sortOrder } } : { sortOrder: { gt: current.sortOrder } },
    orderBy: { sortOrder: direction < 0 ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await db.$transaction([
    db.category.update({ where: { id: current.id }, data: { sortOrder: neighbor.sortOrder } }),
    db.category.update({ where: { id: neighbor.id }, data: { sortOrder: current.sortOrder } }),
  ]);
  await recordAuditEvent(session, "CATEGORY_REORDER", "Category", current.id);
  refreshPublic(["categories"]);
  revalidatePath("/admin/categories");
}

export async function saveProductAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireAdminAction("MENU_MANAGE");
    const parsed = productSchema.safeParse({
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      description: formData.get("description"),
      shortDescription: formData.get("shortDescription"),
      price: formData.get("price"),
      oldPrice: formData.get("oldPrice") || "",
      badge: formData.get("badge"),
      categoryId: formData.get("categoryId"),
      sortOrder: formData.get("sortOrder") || 0,
      isActive: bool(formData, "isActive"),
      isFeatured: bool(formData, "isFeatured"),
      isAvailable: bool(formData, "isAvailable"),
      removeImage: bool(formData, "removeImage"),
    });
    if (!parsed.success) return { ok: false, message: "Ürün bilgilerini kontrol edin.", fieldErrors: fields(parsed.error) };
    const db = getDb();
    const existing = parsed.data.id ? await db.product.findUnique({ where: { id: parsed.data.id } }) : null;
    if (parsed.data.id && !existing) return { ok: false, message: "Düzenlenmek istenen ürün bulunamadı." };
    const categoryExists = await db.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } });
    if (!categoryExists) return { ok: false, message: "Seçilen kategori artık bulunmuyor.", fieldErrors: { categoryId: ["Geçerli bir kategori seçin."] } };
    const imageFile = fileFrom(formData, "image");
    let uploaded: UploadedImage | null = null;
    let savedId = existing?.id;
    try {
      if (imageFile) uploaded = await uploadImage(imageFile, "products");
      const data = {
        name: parsed.data.name,
        slug: slugifyTurkish(parsed.data.name),
        description: parsed.data.description,
        shortDescription: parsed.data.shortDescription || null,
        price: parsed.data.price,
        oldPrice: parsed.data.oldPrice ?? null,
        badge: parsed.data.badge || null,
        categoryId: parsed.data.categoryId,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        isFeatured: parsed.data.isFeatured,
        isAvailable: parsed.data.isAvailable,
        imageUrl: parsed.data.removeImage ? null : uploaded?.url ?? existing?.imageUrl ?? null,
        imagePublicId: parsed.data.removeImage ? null : uploaded?.publicId ?? existing?.imagePublicId ?? null,
      };
      const saved = existing ? await db.product.update({ where: { id: existing.id }, data }) : await db.product.create({ data });
      savedId = saved.id;
    } catch (error) {
      if (uploaded) await deleteImage(uploaded.publicId).catch(() => undefined);
      throw error;
    }
    if ((uploaded || parsed.data.removeImage) && existing?.imagePublicId) await deleteImage(existing.imagePublicId).catch(() => undefined);
    await recordAuditEvent(session, existing ? "PRODUCT_UPDATE" : "PRODUCT_CREATE", "Product", savedId);
    refreshPublic(["products"]);
    revalidatePath("/admin/products");
    return { ok: true, message: existing ? "Ürün güncellendi." : `Ürün eklendi. Düzenleme kimliği: ${savedId}` };
  } catch (error) {
    return { ok: false, message: error instanceof Error && (error.message.includes("Görsel") || error.message.includes("Cloudinary")) ? error.message : "Ürün kaydedilemedi. Aynı adlı bir ürün zaten bulunuyor olabilir." };
  }
}

export async function deleteProductAction(formData: FormData) {
  const session = await requireAdminAction("MENU_MANAGE");
  const input = entityActionSchema.safeParse({ id: formData.get("id") });
  if (!input.success) return;
  const product = await getDb().product.findUnique({ where: { id: input.data.id } });
  if (!product) return;
  await getDb().product.update({ where: { id: product.id }, data: { archivedAt: new Date(), isActive: false, isAvailable: false } });
  await recordAuditEvent(session, "PRODUCT_DELETE", "Product", product.id);
  refreshPublic(["products"]);
  redirect("/admin/products?success=deleted");
}

export async function duplicateProductAction(formData: FormData) {
  const session = await requireAdminAction("MENU_MANAGE");
  const input = entityActionSchema.safeParse({ id: formData.get("id") });
  if (!input.success) return;
  const source = await getDb().product.findUnique({ where: { id: input.data.id } });
  if (!source || source.archivedAt) return;
  const copy = await getDb().product.create({ data: {
    name: `${source.name} (Kopya)`, slug: `${source.slug}-kopya-${Date.now().toString(36)}`,
    description: source.description, shortDescription: source.shortDescription, price: source.price, oldPrice: source.oldPrice,
    badge: source.badge, imageUrl: source.imageUrl, imagePublicId: null, categoryId: source.categoryId,
    isActive: false, isFeatured: false, isAvailable: source.isAvailable,
    sortOrder: source.sortOrder + 1,
  } });
  await recordAuditEvent(session, "PRODUCT_DUPLICATE", "Product", copy.id, { sourceId: source.id });
  refreshPublic(["products"]); revalidatePath("/admin/products");
  redirect(`/admin/products/${copy.id}`);
}

export async function setCategoryAvailabilityAction(formData: FormData) {
  const session = await requireAdminAction("MENU_MANAGE");
  const categoryId = entityActionSchema.parse({ id: formData.get("categoryId") }).id;
  const isAvailable = formData.get("isAvailable") === "true";
  const result = await getDb().product.updateMany({ where: { categoryId, archivedAt: null }, data: { isAvailable } });
  await recordAuditEvent(session, "CATEGORY_AVAILABILITY_UPDATE", "Category", categoryId, { isAvailable, productCount: result.count });
  refreshPublic(["products"]); revalidatePath("/admin/products");
}

export async function toggleProductAvailabilityAction(formData: FormData) {
  const session = await requireAdminAction("MENU_MANAGE");
  const input = toggleAvailabilitySchema.safeParse({ id: formData.get("id"), isAvailable: formData.get("isAvailable") });
  if (!input.success) return;
  const existing = await getDb().product.findUnique({ where: { id: input.data.id }, select: { id: true } });
  if (!existing) return;
  await getDb().product.update({ where: { id: existing.id }, data: { isAvailable: input.data.isAvailable === "true" } });
  await recordAuditEvent(session, "PRODUCT_AVAILABILITY_UPDATE", "Product", existing.id);
  refreshPublic(["products"]);
  revalidatePath("/admin/products");
}

export async function saveSettingsAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireAdminAction("SETTINGS_MANAGE");
    const raw = Object.fromEntries(formData.entries());
    const parsed = settingsSchema.safeParse({ ...raw, showPhoneCta: bool(formData, "showPhoneCta"), showWhatsappCta: bool(formData, "showWhatsappCta"), showDirectionsCta: bool(formData, "showDirectionsCta"), removeLogo: bool(formData, "removeLogo"), removeHeroImage: bool(formData, "removeHeroImage") });
    if (!parsed.success) return { ok: false, message: "Ayar alanlarını kontrol edin.", fieldErrors: fields(parsed.error) };
    const db = getDb();
    const existing = await db.restaurantSettings.findUnique({ where: { id: "singleton" } });
    if (!existing) return { ok: false, message: "Restoran ayar kaydı bulunamadı." };
    const canEditBranding = existing.ownerCanEditBranding;
    const logoFile = canEditBranding ? fileFrom(formData, "logo") : null;
    const heroFile = canEditBranding ? fileFrom(formData, "heroImage") : null;
    let logo: UploadedImage | null = null;
    let hero: UploadedImage | null = null;
    try {
      if (logoFile) logo = await uploadImage(logoFile, "brand");
      if (heroFile) hero = await uploadImage(heroFile, "hero");
      const { removeLogo, removeHeroImage, ...data } = parsed.data;
      const effectiveRemoveLogo = canEditBranding && removeLogo;
      const effectiveRemoveHero = canEditBranding && removeHeroImage;
      await db.restaurantSettings.update({ where: { id: "singleton" }, data: { ...data, ...(canEditBranding ? {} : { themePreset: existing.themePreset, fontPreset: existing.fontPreset, primaryColor: existing.primaryColor, accentColor: existing.accentColor, heroFocalX: existing.heroFocalX, heroFocalY: existing.heroFocalY }), phone: data.phone || null, whatsapp: data.whatsapp || null, email: data.email || null, address: data.address || null, googleMapsUrl: data.googleMapsUrl || null, mapEmbedUrl: data.mapEmbedUrl || null, instagramUrl: data.instagramUrl || null, facebookUrl: data.facebookUrl || null, tiktokUrl: data.tiktokUrl || null, youtubeUrl: data.youtubeUrl || null, xUrl: data.xUrl || null, logoUrl: effectiveRemoveLogo ? null : logo?.url ?? existing.logoUrl, logoPublicId: effectiveRemoveLogo ? null : logo?.publicId ?? existing.logoPublicId, heroImageUrl: effectiveRemoveHero ? null : hero?.url ?? existing.heroImageUrl, heroImagePublicId: effectiveRemoveHero ? null : hero?.publicId ?? existing.heroImagePublicId } });
    } catch (error) {
      if (logo) await deleteImage(logo.publicId).catch(() => undefined);
      if (hero) await deleteImage(hero.publicId).catch(() => undefined);
      throw error;
    }
    if (canEditBranding && (logo || parsed.data.removeLogo) && existing.logoPublicId) await deleteImage(existing.logoPublicId).catch(() => undefined);
    if (canEditBranding && (hero || parsed.data.removeHeroImage) && existing.heroImagePublicId) await deleteImage(existing.heroImagePublicId).catch(() => undefined);
    await recordAuditEvent(session, "SETTINGS_UPDATE", "RestaurantSettings", "singleton");
    refreshPublic(["restaurant-settings"]);
    revalidatePath("/admin/settings");
    return { ok: true, message: "Restoran ayarları kaydedildi." };
  } catch (error) {
    return { ok: false, message: error instanceof Error && (error.message.includes("Görsel") || error.message.includes("Cloudinary")) ? error.message : "Ayarlar kaydedilemedi." };
  }
}

export async function saveOpeningHoursAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireAdminAction("SETTINGS_MANAGE");
    const hours = Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, isClosed: bool(formData, `closed-${dayOfWeek}`), openTime: String(formData.get(`open-${dayOfWeek}`) ?? ""), closeTime: String(formData.get(`close-${dayOfWeek}`) ?? "") }));
    const parsed = hours.map((hour) => openingHourSchema.safeParse(hour));
    const invalid = parsed.find((item) => !item.success);
    if (invalid && !invalid.success) return { ok: false, message: "Çalışma saatlerini kontrol edin." };
    const db = getDb();
    await db.$transaction(hours.map((hour) => db.openingHour.upsert({ where: { settingsId_dayOfWeek: { settingsId: "singleton", dayOfWeek: hour.dayOfWeek } }, update: { isClosed: hour.isClosed, openTime: hour.isClosed ? null : hour.openTime, closeTime: hour.isClosed ? null : hour.closeTime }, create: { settingsId: "singleton", dayOfWeek: hour.dayOfWeek, isClosed: hour.isClosed, openTime: hour.isClosed ? null : hour.openTime, closeTime: hour.isClosed ? null : hour.closeTime } })));
    await recordAuditEvent(session, "OPENING_HOURS_UPDATE", "RestaurantSettings", "singleton");
    refreshPublic(["restaurant-settings"]);
    revalidatePath("/admin/opening-hours");
    return { ok: true, message: "Çalışma saatleri güncellendi." };
  } catch { return { ok: false, message: "Çalışma saatleri kaydedilemedi." }; }
}

export async function saveProfileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireAdminAction();
    const parsed = profileSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return { ok: false, message: "Profil bilgilerini kontrol edin.", fieldErrors: fields(parsed.error) };
    const nextEmail = parsed.data.email.toLowerCase();
    const emailChanged = nextEmail !== session.user.email.toLowerCase();
    const sensitiveChange = emailChanged || Boolean(parsed.data.newPassword);

    if (sensitiveChange && !parsed.data.currentPassword) {
      return { ok: false, message: "E-posta veya parola değiştirmek için mevcut parolanızı girin.", fieldErrors: { currentPassword: ["Mevcut parola gereklidir."] } };
    }

    const requestHeaders = await headers();
    if (sensitiveChange) {
      await auth.api.verifyPassword({ headers: requestHeaders, body: { password: parsed.data.currentPassword! } });
    }

    const db = getDb();
    if (emailChanged) {
      const duplicate = await db.user.findUnique({ where: { email: nextEmail }, select: { id: true } });
      if (duplicate && duplicate.id !== session.user.id) {
        return { ok: false, message: "Bu e-posta adresi başka bir hesap tarafından kullanılıyor.", fieldErrors: { email: ["Bu e-posta adresi kullanımda."] } };
      }
    }

    const newPasswordHash = parsed.data.newPassword ? await hashPassword(parsed.data.newPassword) : null;
    await db.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: session.user.id },
        data: { name: parsed.data.name, email: nextEmail, ...(newPasswordHash ? { mustChangePassword: false } : {}) },
      });

      if (newPasswordHash) {
        await transaction.account.update({
          where: { providerId_accountId: { providerId: "credential", accountId: session.user.id } },
          data: { password: newPasswordHash },
        });
      }

      if (sensitiveChange) {
        await transaction.session.deleteMany({
          where: { userId: session.user.id, id: { not: session.session.id } },
        });
      }
    });
    await recordAuditEvent(session, "PROFILE_UPDATE", "User", session.user.id);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Profil bilgileriniz güncellendi." };
  } catch { return { ok: false, message: "Profil güncellenemedi. E-posta kullanımda veya parola hatalı olabilir." }; }
}
