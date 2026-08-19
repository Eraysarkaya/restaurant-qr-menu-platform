"use server";

import "server-only";
import { randomBytes } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { slugifyTurkish } from "@/lib/format";
import { normalizeInstanceCapabilities } from "@/lib/instance-capabilities";
import { requirePlatformAction } from "@/platform/auth/session";
import { syncLocalInstanceSettings } from "@/platform/instances/service";
import { hashPlatformToken } from "@/platform/security";
import { getDb } from "@/server/db/client";
import { deleteImage, uploadImage, type UploadedImage } from "@/server/media/cloudinary";
import { consumeRateLimit } from "@/server/security/rate-limit";

const SAMPLE_HEROES = ["/demo/restaurant-interior-v2.png", "/demo/hero-kose-mutfak.png", "/demo/burger.png"] as const;
const optionalText = z.preprocess((value) => value === "" ? undefined : value, z.string().trim().max(200).optional());
const domain = z.preprocess((value) => value === "" ? undefined : value, z.string().trim().toLowerCase().regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i, "Geçerli bir alan adı yazın.").optional());
const color = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Renk #RRGGBB biçiminde olmalıdır.");
const instanceSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2, "İşletme adı gereklidir.").max(100),
  domain,
  templatePreset: z.enum(["WARM", "MODERN", "CLASSIC"]),
  fontPreset: z.enum(["MANROPE", "LORA"]),
  featurePreset: z.enum(["QR_MENU_ONLY", "RESTAURANT_WEBSITE", "PREMIUM_WEBSITE"]),
  status: z.enum(["DRAFT", "SETUP", "ACTIVE", "MAINTENANCE", "ERROR", "ARCHIVED"]).default("DRAFT"),
  primaryColor: color,
  accentColor: color,
  heroFocalX: z.coerce.number().int().min(0).max(100),
  heroFocalY: z.coerce.number().int().min(0).max(100),
  selectedHeroUrl: z.enum(SAMPLE_HEROES).optional(),
  primaryContactName: optionalText,
  primaryContactEmail: z.preprocess((value) => value === "" ? undefined : value, z.email("Geçerli bir e-posta yazın.").optional()),
  deploymentProjectId: optionalText,
  managementEndpoint: z.preprocess((value) => value === "" ? undefined : value, z.url("Geçerli bir HTTPS adresi yazın.").refine((value) => value.startsWith("https://"), "Yalnız HTTPS kabul edilir.").optional()),
  ownerCanEditBranding: z.boolean(),
  showHomePage: z.boolean(),
  showAboutPage: z.boolean(),
  showContactPage: z.boolean(),
  showHero: z.boolean(),
  showFeaturedProducts: z.boolean(),
  showMap: z.boolean(),
  showSocialLinks: z.boolean(),
});

const capabilityKeys = ["ownerCanEditBranding", "showHomePage", "showAboutPage", "showContactPage", "showHero", "showFeaturedProducts", "showMap", "showSocialLinks"] as const;

function values(form: FormData) {
  return Object.fromEntries(form.entries());
}

function instanceValues(form: FormData) {
  return { ...values(form), ...Object.fromEntries(capabilityKeys.map((key) => [key, form.get(key) === "on"])) };
}

function fileFrom(form: FormData, key: string) {
  const value = form.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function refreshLocalInstance(id: string) {
  revalidatePath("/platform");
  revalidatePath(`/platform/instances/${id}`);
  updateTag("restaurant-settings");
  revalidatePath("/", "layout");
}

export async function createInstanceAction(_state: ActionState, form: FormData): Promise<ActionState> {
  const session = await requirePlatformAction();
  const parsed = instanceSchema.safeParse(instanceValues(form));
  if (!parsed.success) return { ok: false, message: "Kurulum bilgilerini kontrol edin.", fieldErrors: parsed.error.flatten().fieldErrors };
  if (parsed.data.deploymentProjectId === "local" && await getDb().restaurantInstance.findFirst({ where: { deploymentProjectId: "local" } })) return { ok: false, message: "Bu projede zaten bir yerel restoran kurulumu var." };

  const baseSlug = slugifyTurkish(parsed.data.name) || `restoran-${Date.now()}`;
  let slug = baseSlug;
  for (let suffix = 2; await getDb().restaurantInstance.findUnique({ where: { slug } }); suffix += 1) slug = `${baseSlug}-${suffix}`;

  let logo: UploadedImage | null = null;
  let hero: UploadedImage | null = null;
  let createdId = "";
  try {
    const logoFile = fileFrom(form, "logo");
    const heroFile = fileFrom(form, "heroImage");
    if (logoFile) logo = await uploadImage(logoFile, "brand");
    if (heroFile) hero = await uploadImage(heroFile, "hero");
    const { selectedHeroUrl, ...rawData } = parsed.data;
    const normalized = normalizeInstanceCapabilities(rawData);
    const instance = await getDb().$transaction(async (transaction) => {
      const created = await transaction.restaurantInstance.create({ data: { ...normalized, id: undefined, slug, logoUrl: logo?.url ?? null, logoPublicId: logo?.publicId ?? null, heroImageUrl: hero?.url ?? selectedHeroUrl ?? null, heroImagePublicId: hero?.publicId ?? null } });
      if (created.deploymentProjectId === "local") await syncLocalInstanceSettings(transaction, created);
      await transaction.platformAuditLog.create({ data: { actorId: session.userId, instanceId: created.id, action: "INSTANCE_CREATED", entityType: "RestaurantInstance", entityId: created.id, metadata: { status: created.status, featurePreset: created.featurePreset, templatePreset: created.templatePreset } } });
      return created;
    });
    createdId = instance.id;
    refreshLocalInstance(instance.id);
  } catch (error) {
    if (logo) await deleteImage(logo.publicId).catch(() => undefined);
    if (hero) await deleteImage(hero.publicId).catch(() => undefined);
    return { ok: false, message: error instanceof Error && error.message.includes("Görsel") ? error.message : "Kurulum kaydı oluşturulamadı." };
  }
  redirect(`/platform/instances/${createdId}`);
}

export async function updateInstanceAction(_state: ActionState, form: FormData): Promise<ActionState> {
  let logo: UploadedImage | null = null;
  let hero: UploadedImage | null = null;
  try {
    const session = await requirePlatformAction();
    const parsed = instanceSchema.safeParse(instanceValues(form));
    if (!parsed.success || !parsed.data.id) return { ok: false, message: "Kurulum bilgilerini kontrol edin.", fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors };
    const before = await getDb().restaurantInstance.findUnique({ where: { id: parsed.data.id } });
    if (!before) return { ok: false, message: "Restoran kurulumu bulunamadı." };

    const logoFile = fileFrom(form, "logo");
    const heroFile = fileFrom(form, "heroImage");
    if (logoFile) logo = await uploadImage(logoFile, "brand");
    if (heroFile) hero = await uploadImage(heroFile, "hero");
    const removeLogo = form.get("removeLogo") === "on";
    const removeHero = form.get("removeHeroImage") === "on";
    const effectiveRemoveLogo = removeLogo && !logo;
    const effectiveRemoveHero = removeHero && !hero;
    const { selectedHeroUrl, ...rawData } = parsed.data;
    const normalized = normalizeInstanceCapabilities(rawData);
    const media = {
      logoUrl: effectiveRemoveLogo ? null : logo?.url ?? before.logoUrl,
      logoPublicId: effectiveRemoveLogo ? null : logo?.publicId ?? before.logoPublicId,
      heroImageUrl: effectiveRemoveHero ? null : hero?.url ?? selectedHeroUrl ?? before.heroImageUrl,
      heroImagePublicId: effectiveRemoveHero ? null : hero?.publicId ?? (selectedHeroUrl ? null : before.heroImagePublicId),
    };
    const after = await getDb().$transaction(async (transaction) => {
      const updated = await transaction.restaurantInstance.update({ where: { id: before.id }, data: { ...normalized, id: undefined, ...media } });
      if (before.deploymentProjectId === "local") await syncLocalInstanceSettings(transaction, updated);
      await transaction.platformAuditLog.create({ data: { actorId: session.userId, instanceId: updated.id, action: "INSTANCE_UPDATED", entityType: "RestaurantInstance", entityId: updated.id, metadata: { before: { status: before.status, templatePreset: before.templatePreset, fontPreset: before.fontPreset }, after: { status: updated.status, templatePreset: updated.templatePreset, fontPreset: updated.fontPreset } } } });
      return updated;
    });
    if ((logo || effectiveRemoveLogo) && before.logoPublicId) await deleteImage(before.logoPublicId).catch(() => undefined);
    if ((hero || effectiveRemoveHero || selectedHeroUrl) && before.heroImagePublicId) await deleteImage(before.heroImagePublicId).catch(() => undefined);
    refreshLocalInstance(after.id);
    return { ok: true, message: before.deploymentProjectId === "local" ? "Görünüm kaydedildi ve müşteri sitesine uygulandı." : "Kurulum görünümü kaydedildi." };
  } catch (error) {
    if (logo) await deleteImage(logo.publicId).catch(() => undefined);
    if (hero) await deleteImage(hero.publicId).catch(() => undefined);
    return { ok: false, message: error instanceof Error && error.message.includes("Görsel") ? error.message : "Kurulum kaydı güncellenemedi." };
  }
}

export type InvitationState = ActionState & { setupCode?: string };

export async function createOwnerInvitationAction(_state: InvitationState, form: FormData): Promise<InvitationState> {
  try {
    const session = await requirePlatformAction();
    const rate = await consumeRateLimit(`owner-invitation:${session.userId}`, 20, 3600);
    if (!rate.allowed) return { ok: false, message: "Saatlik davet sınırına ulaşıldı." };
    const parsed = z.object({ instanceId: z.string().cuid(), email: z.email("Geçerli bir e-posta yazın.") }).safeParse(values(form));
    if (!parsed.success) return { ok: false, message: "Davet e-postasını kontrol edin.", fieldErrors: parsed.error.flatten().fieldErrors };
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const invitation = await getDb().ownerInvitation.create({ data: { instanceId: parsed.data.instanceId, createdById: session.userId, email: parsed.data.email.toLowerCase(), tokenHash: hashPlatformToken(token), expiresAt } });
    await getDb().platformAuditLog.create({ data: { actorId: session.userId, instanceId: parsed.data.instanceId, action: "OWNER_INVITATION_CREATED", entityType: "OwnerInvitation", entityId: invitation.id, metadata: { expiresAt: expiresAt.toISOString() } } });
    return { ok: true, message: "Tek kullanımlık kurulum kodu oluşturuldu. Bu kod bir daha gösterilmeyecek.", setupCode: token };
  } catch {
    return { ok: false, message: "Davet oluşturulamadı." };
  }
}
