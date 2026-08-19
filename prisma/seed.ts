import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL gereklidir.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const categories = [
  { name: "Hamburgerler", slug: "hamburgerler", description: "Günlük hazırlanan köfteler ve taze malzemeler.", sortOrder: 10, imageUrl: "/demo/burger.png" },
  { name: "Tostlar", slug: "tostlar", description: "Bol malzemeli, dışı çıtır sıcak tostlar.", sortOrder: 20, imageUrl: "/demo/tost-cheesecake.png" },
  { name: "Menüler", slug: "menuler", description: "Doyurucu ana ürün, patates ve içecek seçenekleri.", sortOrder: 30, imageUrl: "/demo/hero-kose-mutfak.png" },
  { name: "Tatlılar", slug: "tatlilar", description: "Kahvenin yanına ev yapımı tatlılar.", sortOrder: 40, imageUrl: "/demo/tost-cheesecake.png" },
  { name: "Soğuk İçecekler", slug: "soguk-icecekler", description: "Serinleten klasikler ve ev yapımı limonata.", sortOrder: 50, imageUrl: "/demo/hero-kose-mutfak.png" },
];

const products = [
  ["Klasik Burger", "klasik-burger", "Hamburgerler", "120 gr dana köfte, özel sos, marul, domates ve turşu.", "249.90", true, "/demo/burger.png"],
  ["Cheeseburger", "cheeseburger", "Hamburgerler", "120 gr dana köfte, cheddar peyniri, karamelize soğan ve özel sos.", "279.90", true, "/demo/burger.png"],
  ["Double Burger", "double-burger", "Hamburgerler", "İki kat dana köfte, iki kat cheddar, turşu ve ev yapımı burger sosu.", "359.90", false, "/demo/burger.png"],
  ["Karışık Tost", "karisik-tost", "Tostlar", "Sucuk, kaşar peyniri, domates ve turşu ile bol malzemeli tost.", "189.90", true, "/demo/tost-cheesecake.png"],
  ["Kaşarlı Tost", "kasarli-tost", "Tostlar", "Bol kaşar peyniri ve tereyağı ile klasik lezzet.", "149.90", false, "/demo/tost-cheesecake.png"],
  ["Burger Menü", "burger-menu", "Menüler", "Klasik burger, baharatlı patates kızartması ve kutu içecek.", "329.90", true, "/demo/hero-kose-mutfak.png"],
  ["San Sebastian Cheesecake", "san-sebastian-cheesecake", "Tatlılar", "Yoğun kıvamlı, karamelize üst yüzeyli günlük cheesecake.", "169.90", true, "/demo/tost-cheesecake.png"],
  ["Ayran", "ayran", "Soğuk İçecekler", "Soğuk, köpüklü geleneksel ayran.", "49.90", false, "/demo/hero-kose-mutfak.png"],
  ["Kola", "kola", "Soğuk İçecekler", "330 ml kutu kola.", "59.90", false, "/demo/hero-kose-mutfak.png"],
  ["Ev Yapımı Limonata", "ev-yapimi-limonata", "Soğuk İçecekler", "Taze limon ve nane ile günlük hazırlanan limonata.", "79.90", true, "/demo/hero-kose-mutfak.png"],
] as const;

async function main() {
  const restaurantSettings = await prisma.restaurantSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "Köşe Mutfak",
      shortDescription: "Mahallenin samimi köşesinde, özenle hazırlanan burgerler, tostlar ve tatlılar.",
      longDescription: "Köşe Mutfak, iyi yemeğin abartıya ihtiyaç duymadığına inanır. Günlük hazırlanan malzemeler, güvenilir tedarikçiler ve özenli servisle her tabağı sıcak bir mahalle buluşmasına dönüştürüyoruz. İster hızlı bir öğle molası ister uzun bir kahve sohbeti olsun, kapımız her zaman açık.",
      heroTitle: "Mahallenin en lezzetli köşesi.",
      heroSubtitle: "Günlük hazırlanan köfteler, çıtır tostlar ve kahvenin yanına iyi giden tatlılar. Sıcak, sade ve gerçekten lezzetli.",
      heroImageUrl: "/demo/hero-kose-mutfak.png",
      phone: "+90 212 555 24 24",
      whatsapp: "+90 555 555 24 24",
      email: "merhaba@kosemutfak.com",
      address: "Caferağa Mah. Moda Cad. No: 24, Kadıköy / İstanbul",
      googleMapsUrl: "https://maps.google.com/?q=Moda+Kadikoy+Istanbul",
      instagramUrl: "https://instagram.com/kosemutfak",
      primaryColor: "#B4532A",
      accentColor: "#66704A",
      openingHours: {
        create: Array.from({ length: 7 }, (_, dayOfWeek) => ({
          dayOfWeek,
          isClosed: dayOfWeek === 6,
          openTime: dayOfWeek === 6 ? null : "09:00",
          closeTime: dayOfWeek === 6 ? null : dayOfWeek >= 4 ? "00:00" : "23:00",
        })),
      },
    },
  });

  await prisma.restaurantInstance.upsert({
    where: { slug: "local-restaurant" },
    update: {},
    create: {
      name: restaurantSettings.name,
      slug: "local-restaurant",
      status: "ACTIVE",
      templatePreset: restaurantSettings.themePreset,
      fontPreset: restaurantSettings.fontPreset,
      featurePreset: restaurantSettings.featurePreset,
      deploymentProjectId: "local",
      primaryContactEmail: process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase(),
      logoUrl: restaurantSettings.logoUrl,
      heroImageUrl: restaurantSettings.heroImageUrl,
      heroFocalX: restaurantSettings.heroFocalX,
      heroFocalY: restaurantSettings.heroFocalY,
      primaryColor: restaurantSettings.primaryColor,
      accentColor: restaurantSettings.accentColor,
      ownerCanEditBranding: restaurantSettings.ownerCanEditBranding,
      showHomePage: restaurantSettings.showHomePage,
      showAboutPage: restaurantSettings.showAboutPage,
      showContactPage: restaurantSettings.showContactPage,
      showHero: restaurantSettings.showHero,
      showFeaturedProducts: restaurantSettings.showFeaturedProducts,
      showMap: restaurantSettings.showMap,
      showSocialLinks: restaurantSettings.showSocialLinks,
    },
  });

  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
  }

  const categoryRows = await prisma.category.findMany();
  const categoryMap = new Map(categoryRows.map((category) => [category.name, category.id]));
  for (const [name, slug, categoryName, description, price, isFeatured, imageUrl] of products) {
    const categoryId = categoryMap.get(categoryName);
    if (!categoryId) continue;
    await prisma.product.upsert({
      where: { slug },
      update: { name, description, price, isFeatured, imageUrl, categoryId },
      create: { name, slug, description, price, isFeatured, imageUrl, categoryId, sortOrder: products.findIndex((item) => item[1] === slug) * 10 },
    });
  }

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error("ADMIN_BOOTSTRAP_PASSWORD en az 12 karakter olmalıdır.");
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: { name: process.env.ADMIN_BOOTSTRAP_NAME ?? "Köşe Mutfak Yöneticisi", role: "OWNER", isActive: true },
      create: { email: email.toLowerCase(), name: process.env.ADMIN_BOOTSTRAP_NAME ?? "Köşe Mutfak Yöneticisi", role: "OWNER", emailVerified: true },
    });
    const passwordHash = await hashPassword(password);
    await prisma.account.upsert({
      where: { providerId_accountId: { providerId: "credential", accountId: user.id } },
      update: { password: passwordHash },
      create: { providerId: "credential", accountId: user.id, userId: user.id, password: passwordHash },
    });
  }

  const platformEmail = process.env.PLATFORM_BOOTSTRAP_EMAIL;
  const platformPassword = process.env.PLATFORM_BOOTSTRAP_PASSWORD;
  if (platformEmail && platformPassword) {
    if (platformPassword.length < 12) throw new Error("PLATFORM_BOOTSTRAP_PASSWORD en az 12 karakter olmalıdır.");
    await prisma.platformUser.upsert({
      where: { email: platformEmail.toLowerCase() },
      update: {
        name: process.env.PLATFORM_BOOTSTRAP_NAME ?? "Platform Geliştiricisi",
        passwordHash: await hashPassword(platformPassword),
        isActive: true,
      },
      create: {
        email: platformEmail.toLowerCase(),
        name: process.env.PLATFORM_BOOTSTRAP_NAME ?? "Platform Geliştiricisi",
        passwordHash: await hashPassword(platformPassword),
      },
    });
  }
}

main()
  .then(() => console.log("Köşe Mutfak demo verileri hazır."))
  .finally(async () => prisma.$disconnect());
