import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { RESTAURANT_SETTINGS_ID } from "@/lib/constants";
import { getDb } from "@/server/db/client";

export const getPublicSettings = cache(
  unstable_cache(
    async () =>
      getDb().restaurantSettings.findUnique({
        where: { id: RESTAURANT_SETTINGS_ID },
        include: { openingHours: { orderBy: { dayOfWeek: "asc" } } },
      }),
    ["public-settings"],
    { tags: ["restaurant-settings"], revalidate: 3600 },
  ),
);

export const getActiveCategories = unstable_cache(
  async () =>
    getDb().category.findMany({
      where: { isActive: true, archivedAt: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ["active-categories"],
  { tags: ["categories"], revalidate: 3600 },
);

export const getFeaturedProducts = unstable_cache(
  async () =>
    getDb().product.findMany({
      where: { isActive: true, isFeatured: true, archivedAt: null, category: { isActive: true, archivedAt: null } },
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 6,
    }),
  ["featured-products"],
  { tags: ["products", "categories"], revalidate: 1800 },
);

const getCachedMenu = unstable_cache(async (categorySlug: string, query: string) => {
  return getDb().category.findMany({
    where: {
      isActive: true,
      archivedAt: null,
      ...(categorySlug ? { slug: categorySlug } : {}),
    },
    include: {
      products: {
        where: {
          isActive: true,
          archivedAt: null,
          ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}, ["public-menu"], { tags: ["products", "categories"], revalidate: 1800 });

export async function getMenu(categorySlug?: string, query?: string) {
  const safeCategorySlug = (categorySlug ?? "").trim().slice(0, 100);
  const safeQuery = (query ?? "").trim().slice(0, 80);
  return getCachedMenu(safeCategorySlug, safeQuery);
}

export async function getPublicProduct(slug: string) {
  const safeSlug = slug.trim().slice(0, 120);
  if (!safeSlug) return null;
  return getDb().product.findFirst({
    where: { slug: safeSlug, isActive: true, archivedAt: null, category: { isActive: true, archivedAt: null } },
    include: { category: { select: { name: true, slug: true } } },
  });
}
