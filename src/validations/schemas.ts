import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

function optionalHttpsUrl(allowedHosts?: string[]) {
  return z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .url("Geçerli bir URL girin.")
        .refine((value) => {
          const url = new URL(value);
          return url.protocol === "https:" && (!allowedHosts || allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)));
        }, "Yalnızca izin verilen güvenli HTTPS adreslerini kullanın."),
    ])
    .optional();
}

const optionalEmail = z.string().trim().email("Geçerli bir e-posta girin.").optional().or(z.literal(""));
const optionalPhone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s()-]{7,20}$/, "Geçerli bir telefon numarası girin.")
  .optional()
  .or(z.literal(""));
const entityId = z.string().trim().min(1).max(64);

const normalizedMoney = z
  .string()
  .trim()
  .regex(/^(0|[1-9]\d{0,5})(\.\d{1,2})?$/, "En fazla iki ondalık basamaklı geçerli bir fiyat girin.")
  .refine((value) => Number(value) > 0, "Fiyat sıfırdan büyük olmalıdır.")
  .transform((value) => Number(value).toFixed(2));

const moneyInput = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().replace(",", ".") : String(value ?? "")),
  normalizedMoney,
);

const optionalMoneyInput = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    return typeof value === "string" ? value.trim().replace(",", ".") : String(value);
  },
  normalizedMoney.optional(),
);

export const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta girin."),
  password: z.string().min(12, "Parola en az 12 karakter olmalıdır.").max(128),
});

export const categorySchema = z.object({
  id: entityId.optional(),
  name: z.string().trim().min(2, "Kategori adı en az 2 karakter olmalıdır.").max(80),
  description: optionalText(300),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
  removeImage: z.boolean().optional(),
});

export const productSchema = z
  .object({
    id: entityId.optional(),
    name: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalıdır.").max(100),
    description: z.string().trim().min(10, "Açıklama en az 10 karakter olmalıdır.").max(800),
    shortDescription: optionalText(180),
    price: moneyInput,
    oldPrice: optionalMoneyInput,
    badge: optionalText(30),
    categoryId: entityId,
    sortOrder: z.coerce.number().int().min(0).max(9999),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    isAvailable: z.boolean(),
    removeImage: z.boolean().optional(),
  })
  .refine((data) => !data.oldPrice || Number(data.oldPrice) >= Number(data.price), {
    path: ["oldPrice"],
    message: "Eski fiyat güncel fiyattan düşük olamaz.",
  });

export const settingsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  shortDescription: z.string().trim().min(10).max(220),
  longDescription: z.string().trim().min(30).max(3000),
  heroTitle: z.string().trim().min(5).max(120),
  heroSubtitle: z.string().trim().min(10).max(260),
  themePreset: z.enum(["WARM", "MODERN", "CLASSIC"]),
  fontPreset: z.enum(["MANROPE", "LORA"]),
  heroFocalX: z.coerce.number().int().min(0).max(100),
  heroFocalY: z.coerce.number().int().min(0).max(100),
  phone: optionalPhone,
  whatsapp: optionalPhone,
  email: optionalEmail,
  address: optionalText(300),
  googleMapsUrl: optionalHttpsUrl(["google.com", "goo.gl"]),
  mapEmbedUrl: optionalHttpsUrl(["google.com", "googleapis.com"]),
  instagramUrl: optionalHttpsUrl(["instagram.com"]),
  facebookUrl: optionalHttpsUrl(["facebook.com", "fb.com"]),
  tiktokUrl: optionalHttpsUrl(["tiktok.com"]),
  youtubeUrl: optionalHttpsUrl(["youtube.com", "youtu.be"]),
  xUrl: optionalHttpsUrl(["x.com", "twitter.com"]),
  showPhoneCta: z.boolean(),
  showWhatsappCta: z.boolean(),
  showDirectionsCta: z.boolean(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Renk #RRGGBB biçiminde olmalıdır."),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Renk #RRGGBB biçiminde olmalıdır."),
  currency: z.string().length(3),
  locale: z.string().min(2).max(20),
  timezone: z.string().min(3).max(80).refine((value) => {
    try {
      new Intl.DateTimeFormat("tr-TR", { timeZone: value }).format();
      return true;
    } catch {
      return false;
    }
  }, "Geçerli bir IANA timezone girin."),
  removeLogo: z.boolean().optional(),
  removeHeroImage: z.boolean().optional(),
});

export const openingHourSchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    isClosed: z.boolean(),
    openTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().or(z.literal("")),
    closeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().or(z.literal("")),
  })
  .refine((data) => data.isClosed || (data.openTime && data.closeTime), {
    message: "Açık günler için açılış ve kapanış saati gerekir.",
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  currentPassword: z.string().max(128).optional().or(z.literal("")),
  newPassword: z.string().min(12, "Yeni parola en az 12 karakter olmalıdır.").max(128).optional().or(z.literal("")),
});

export const entityActionSchema = z.object({ id: entityId });
export const moveCategorySchema = entityActionSchema.extend({ direction: z.enum(["up", "down"]) });
export const toggleAvailabilitySchema = entityActionSchema.extend({ isAvailable: z.enum(["true", "false"]) });
