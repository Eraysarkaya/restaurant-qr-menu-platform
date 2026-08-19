import { describe, expect, it } from "vitest";
import { entityActionSchema, moveCategorySchema, productSchema, settingsSchema, toggleAvailabilitySchema } from "@/validations/schemas";

const settings = {
  name: "Köşe Mutfak",
  shortDescription: "Mahallenin sıcak ve samimi restoranı.",
  longDescription: "Her tabağı özenle ve günlük malzemelerle hazırladığımız uzun restoran hikâyesi.",
  heroTitle: "İyi yemek burada başlar",
  heroSubtitle: "Günlük hazırlanan sevilen lezzetler ve samimi servis.",
  themePreset: "WARM",
  fontPreset: "LORA",
  heroFocalX: 50,
  heroFocalY: 50,
  phone: "+90 555 111 22 33",
  whatsapp: "+90 555 111 22 33",
  email: "merhaba@example.com",
  address: "Kadıköy, İstanbul",
  googleMapsUrl: "https://maps.google.com/?q=Kadikoy",
  mapEmbedUrl: "",
  instagramUrl: "https://instagram.com/kosemutfak",
  facebookUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  xUrl: "",
  showPhoneCta: true,
  showWhatsappCta: true,
  showDirectionsCta: true,
  primaryColor: "#B4532A",
  accentColor: "#66704A",
  currency: "TRY",
  locale: "tr-TR",
  timezone: "Europe/Istanbul",
};

describe("ayar doğrulaması", () => {
  it("güvenli ve izin verilen ayarları kabul eder", () => expect(settingsSchema.safeParse(settings).success).toBe(true));
  it("HTTP ve izin verilmeyen sosyal hostları reddeder", () => {
    expect(settingsSchema.safeParse({ ...settings, instagramUrl: "http://evil.example/profile" }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...settings, googleMapsUrl: "https://not-google.example/map" }).success).toBe(false);
  });
  it("geçersiz telefon, renk ve timezone'u reddeder", () => {
    expect(settingsSchema.safeParse({ ...settings, phone: "telefon", primaryColor: "red", timezone: "Mars/Olympus" }).success).toBe(false);
  });
  it("tanımsız tema veya sınır dışı görsel odağını reddeder", () => {
    expect(settingsSchema.safeParse({ ...settings, themePreset: "NEON" }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...settings, heroFocalX: 101 }).success).toBe(false);
  });
});

describe("ürün doğrulaması", () => {
  const product = { name: "Köşe Burger", description: "Ev yapımı sos ve taze malzemelerle hazırlanır.", shortDescription: "", price: "250.50", oldPrice: "300", badge: "", categoryId: "category", sortOrder: "0", isActive: true, isFeatured: true, isAvailable: true };
  it("ondalıklı fiyatı Decimal için iki basamaklı metne dönüştürür", () => expect(productSchema.parse(product).price).toBe("250.50"));
  it("virgüllü fiyatı kabul eder, ikiden fazla ondalık basamağı reddeder", () => {
    expect(productSchema.parse({ ...product, price: "250,5" }).price).toBe("250.50");
    expect(productSchema.safeParse({ ...product, price: "250.555" }).success).toBe(false);
  });
  it("güncel fiyattan düşük eski fiyatı reddeder", () => expect(productSchema.safeParse({ ...product, oldPrice: "200" }).success).toBe(false));
});

describe("yönetim işlemi girdileri", () => {
  it("boş veya aşırı uzun kimlikleri reddeder", () => {
    expect(entityActionSchema.safeParse({ id: "" }).success).toBe(false);
    expect(entityActionSchema.safeParse({ id: "x".repeat(65) }).success).toBe(false);
  });

  it("yalnızca tanımlı sıralama ve mevcudiyet değerlerini kabul eder", () => {
    expect(moveCategorySchema.safeParse({ id: "category", direction: "left" }).success).toBe(false);
    expect(toggleAvailabilitySchema.safeParse({ id: "product", isAvailable: "1" }).success).toBe(false);
  });
});
