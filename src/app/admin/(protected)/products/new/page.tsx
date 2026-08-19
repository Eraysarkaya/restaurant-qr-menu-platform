import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { getAdminDb } from "@/server/dal/admin";

export default async function NewProductPage() {
  const db = await getAdminDb();
  const categories = await db.category.findMany({ where: { isActive: true, archivedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });

  return (
    <div className="mx-auto max-w-4xl">
      <Button asChild variant="ghost" className="-ml-4">
        <Link href="/admin/products">← Ürünlere dön</Link>
      </Button>
      <div className="my-6">
        <h1 className="font-heading text-4xl font-bold">Yeni ürün</h1>
        <p className="mt-2 text-muted-foreground">Menüye yeni bir ürün ekleyin.</p>
      </div>
      {categories.length ? (
        <ProductForm categories={categories} />
      ) : (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p>Ürün eklemek için önce aktif bir kategori oluşturun.</p>
          <Button asChild className="mt-4"><Link href="/admin/categories">Kategori oluştur</Link></Button>
        </div>
      )}
    </div>
  );
}
