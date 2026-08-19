import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { getAdminDb } from "@/server/dal/admin";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || id.length > 64) notFound();

  const db = await getAdminDb();
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ where: { archivedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Button asChild variant="ghost" className="-ml-4"><Link href="/admin/products">← Ürünlere dön</Link></Button>
      <div className="my-6">
        <h1 className="font-heading text-4xl font-bold">{product.name}</h1>
        <p className="mt-2 text-muted-foreground">Ürün bilgilerini ve yayın durumunu düzenleyin.</p>
      </div>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price.toString(),
          oldPrice: product.oldPrice?.toString(),
          badge: product.badge,
          categoryId: product.categoryId,
          sortOrder: product.sortOrder,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isAvailable: product.isAvailable,
          imageUrl: product.imageUrl,
        }}
      />
    </div>
  );
}
