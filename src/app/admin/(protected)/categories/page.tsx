import { ArrowDown, ArrowUp } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCategoryAction, moveCategoryAction } from "@/features/admin/actions";
import { getAdminDb } from "@/server/dal/admin";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const db = await getAdminDb();
  const params = await searchParams;
  const categories = await db.category.findMany({
    where: { archivedAt: null },
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-bold">Kategoriler</h1>
        <p className="mt-2 text-muted-foreground">Menü bölümlerini, sıralarını ve görünürlüklerini yönetin.</p>
      </div>

      {params.error ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{params.error === "not-empty" ? "Bu kategoride ürünler var. Önce ürünleri başka kategoriye taşıyın veya silin." : "Kategori işlemi tamamlanamadı."}</div> : null}
      {params.success ? <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{params.success === "deleted" ? "Kategori arşivlendi." : "Kategori işlemi tamamlandı."}</div> : null}

      <Card>
        <CardHeader>
          <CardTitle>Yeni kategori</CardTitle>
          <CardDescription>Yeni bir menü bölümü oluşturun.</CardDescription>
        </CardHeader>
        <CardContent><CategoryForm compact /></CardContent>
      </Card>

      <section aria-labelledby="category-list-title" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="category-list-title" className="font-heading text-3xl font-bold">Mevcut kategoriler</h2>
            <p className="mt-1 text-sm text-muted-foreground">{categories.length} kategori</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">Henüz kategori yok.</div>
        ) : (
          <div className="grid gap-5">
            {categories.map((category, index) => (
              <Card key={category.id}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category._count.products} ürün · sıra {category.sortOrder}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <form action={moveCategoryAction}>
                      <input type="hidden" name="id" value={category.id} />
                      <input type="hidden" name="direction" value="up" />
                      <Button type="submit" size="icon" variant="ghost" disabled={index === 0} aria-label={`${category.name} kategorisini yukarı taşı`}><ArrowUp /></Button>
                    </form>
                    <form action={moveCategoryAction}>
                      <input type="hidden" name="id" value={category.id} />
                      <input type="hidden" name="direction" value="down" />
                      <Button type="submit" size="icon" variant="ghost" disabled={index === categories.length - 1} aria-label={`${category.name} kategorisini aşağı taşı`}><ArrowDown /></Button>
                    </form>
                    <ConfirmDelete
                      id={category.id}
                      title={`${category.name} silinsin mi?`}
                      description={category._count.products > 0 ? "Bu kategoride ürünler bulunuyor. Silme işlemi reddedilecek; önce ürünleri taşımanız veya silmeniz gerekir." : "Kategori kalıcı olarak silinecek. Bu işlem geri alınamaz."}
                      action={deleteCategoryAction}
                    />
                  </div>
                </CardHeader>
                <CardContent><CategoryForm initial={category} compact /></CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
