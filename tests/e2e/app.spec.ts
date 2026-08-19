import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@kosemutfak.local";
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "KoseMutfak-2026!";
let authenticatedCookies: Parameters<BrowserContext["addCookies"]>[0] | null = null;

async function login(page: Page) {
  if (authenticatedCookies) await page.context().addCookies(authenticatedCookies);
  await page.goto("/admin");
  if (page.url().includes("/admin/login")) {
    await page.getByLabel("E-posta").fill(adminEmail);
    await page.getByLabel("Parola").fill(adminPassword);
    await page.getByRole("button", { name: "Güvenli giriş yap" }).click();
    await page.waitForURL(/\/admin/);
    await page.goto("/admin");
  }
  await expect(page.getByRole("heading", { name: "Köşe Mutfak" })).toBeVisible();
  authenticatedCookies = await page.context().cookies();
}

test("mobil public navigasyon sade ve kullanılabilir", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  const navigation = page.getByRole("navigation", { name: "Mobil navigasyon" });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Menü" })).toBeVisible();
  await navigation.getByRole("link", { name: "Menü" }).click();
  await expect(page.getByRole("heading", { name: "Bugün ne yiyelim?" })).toBeVisible();
});

test("ana sayfa tek menü eylemiyle odaklı açılır", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const hero = page.locator("main section").first();
  await expect(hero.getByRole("link", { name: "Menüyü gör" })).toHaveCount(1);
  await expect(page.getByRole("link", { name: /Sipariş ver|Sepet/i })).toHaveCount(0);
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await hero.evaluate((element) => element.getBoundingClientRect().height)).toBeLessThanOrEqual(620);
});

test("QR menü salt okunur ürün detayına gider", async ({ page }) => {
  await page.goto("/menu");
  const product = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Cheeseburger" }) }).first();
  await expect(product.getByRole("button", { name: /Sepete ekle/i })).toHaveCount(0);
  await product.getByRole("link", { name: "İncele" }).click();
  await expect(page).toHaveURL(/\/menu\/product\/cheeseburger$/);
  await expect(page.getByRole("heading", { name: "Cheeseburger" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Sepete ekle/i })).toHaveCount(0);
});

test("kaldırılan sipariş rotaları 404 döndürür", async ({ request }) => {
  for (const path of ["/checkout", "/kitchen", "/payment/success", "/api/payments/paytr/callback"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test("public ve admin telefon genişliklerinde yatay taşmaz", async ({ page }) => {
  for (const width of [375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ["/", "/menu", "/contact"]) {
      await page.goto(path);
      const sizes = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
      expect(sizes.document, `${path} ${width}px genişliğinde taşıyor`).toBeLessThanOrEqual(sizes.viewport);
    }
  }
  await login(page);
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto("/admin");
  const sizes = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
  await page.getByRole("button", { name: "Yönetim menüsünü aç" }).click();
  const nav = page.getByRole("navigation", { name: "Yönetim menüsü" });
  await expect(nav).toBeVisible();
  await expect(nav.getByText("Siparişler")).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "QR Kodum" })).toBeVisible();
});

test("admin ürün CRUD ve public yansıması", async ({ page }) => {
  const name = `E2E Menü Ürünü ${Date.now()}`;
  await login(page);
  await page.goto("/admin/products/new");
  await page.getByLabel("Ürün adı").fill(name);
  await page.getByLabel("Açıklama", { exact: true }).fill("E2E doğrulaması için günlük hazırlanan örnek menü ürünü.");
  await page.getByLabel("Fiyat (₺)").fill("345.67");
  await page.getByLabel("Kategori").selectOption({ label: "Hamburgerler" });
  await page.getByRole("button", { name: "Ürünü ekle" }).click();
  await expect(page.getByText("Ürün eklendi.", { exact: false })).toBeVisible();

  await page.goto(`/menu?q=${encodeURIComponent(name)}`);
  const publicProduct = page.getByRole("article").filter({ has: page.getByRole("heading", { name }) });
  await expect(publicProduct).toContainText("₺345,67");

  await page.goto(`/admin/products?q=${encodeURIComponent(name)}`);
  const adminProduct = page.getByRole("article").filter({ has: page.getByRole("heading", { name }) });
  await adminProduct.getByRole("button", { name: "Arşivle" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Arşivle", exact: true }).click();
  await expect(page).toHaveURL(/success=deleted/);
});

test("tek kalıcı QR yönetim sayfası açılır", async ({ page }) => {
  await login(page);
  await page.goto("/admin/qr");
  await expect(page.getByRole("heading", { name: "Tek QR kodunuz" })).toBeVisible();
  await expect(page.getByText("/menu", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /PNG indir/i })).toBeVisible();
});

test("geliştirici kontrol alanı restoran girişinden ayrıdır", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/platform/login");
  await page.getByLabel("Geliştirici e-postası").fill(process.env.PLATFORM_BOOTSTRAP_EMAIL ?? "developer@platform.local");
  await page.getByLabel("Parola").fill(process.env.PLATFORM_BOOTSTRAP_PASSWORD ?? "Platform-Demo-2026!");
  await page.getByRole("button", { name: "Kontrol paneline gir" }).click();
  await page.waitForURL(/\/platform$/);
  await expect(page.getByRole("heading", { name: "Restoran kurulumları" })).toBeVisible();
  await expect(page.getByText("Köşe Mutfak").first()).toBeVisible();
});
