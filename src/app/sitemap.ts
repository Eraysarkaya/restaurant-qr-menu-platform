import type { MetadataRoute } from "next";
import { appUrl } from "@/server/env";
import { getDb } from "@/server/db/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl().replace(/\/$/, "");
  const now = new Date();
  const settings = await getDb().restaurantSettings.findUnique({ where: { id: "singleton" }, select: { showHomePage: true, showAboutPage: true, showContactPage: true } }).catch(() => null);
  const staticRoutes: MetadataRoute.Sitemap = [
    ...(settings?.showHomePage !== false ? [{ url: base, lastModified: now, changeFrequency: "weekly" as const, priority: 1 }] : []),
    { url: `${base}/menu`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...(settings?.showAboutPage !== false ? [{ url: `${base}/about`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 }] : []),
    ...(settings?.showContactPage !== false ? [{ url: `${base}/contact`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 }] : []),
  ];

  try {
    const [categories, products] = await Promise.all([getDb().category.findMany({
      where: { isActive: true, archivedAt: null },
      select: { slug: true, updatedAt: true },
      orderBy: { sortOrder: "asc" },
    }), getDb().product.findMany({ where: { isActive: true, archivedAt: null, category: { isActive: true, archivedAt: null } }, select: { slug: true, updatedAt: true } })]);
    return [...staticRoutes, ...categories.map((category) => ({
      url: `${base}/menu/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })), ...products.map((product) => ({ url: `${base}/menu/product/${product.slug}`, lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 }))];
  } catch {
    return staticRoutes;
  }
}
