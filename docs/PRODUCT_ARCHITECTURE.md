# Ürün mimarisi

## Üç bağımsız alan

| Alan | Giriş | Temel veri | Amaç |
|---|---|---|---|
| Public | Yok | `RestaurantSettings`, `OpeningHour`, `Category`, `Product` | Web sitesi ve kalıcı QR menü |
| İşletme | `/admin/login` | `User`, `Account`, `Session`, `AuditLog` | İçerik ve menü yönetimi |
| Geliştirici | `/platform/login` | `PlatformUser`, `PlatformSession`, `RestaurantInstance` | Kurulum, tema, özellik ve destek |

Restoran ve geliştirici hesapları aynı kullanıcı tablosunu, giriş sayfasını veya cookie’yi paylaşmaz.

## Veri akışı

`RestaurantInstance` kuruluma ait secretsız şablon metadata’sını tutar. Yerel instance kaydedildiğinde `syncLocalInstanceSettings` seçili şablon, font, renk, logo, kapak, odak ve bölüm bayraklarını aynı transaction içinde singleton `RestaurantSettings` kaydına taşır. Cache tag ve public layout yeniden doğrulanır.

İşletme sahibi yalnız geliştiricinin `ownerCanEditBranding` izni verdiği kurulumlarda görünümü değiştirebilir. Bu kilit arayüzde gizlemenin yanında Server Action içinde de uygulanır.

## Menü ve QR

- Public sorgular yalnız `isActive=true`, `archivedAt=null` kategori ve ürünleri döndürür.
- Ürün fiyatı `DECIMAL(10,2)` olarak tutulur.
- Kategori silme ilişkisi `RESTRICT`; ürün içeren kategori arşivlenemez.
- Ürün/kategori “silme” işlemleri audit kaydıyla arşivler.
- QR yalnız canonical `APP_URL/menu` adresini kodlar; içerik değişse de yeniden basılmaz.

## Migration ve operasyon

- Şema değişiklikleri yalnız ileri migration ile yapılır.
- Production deploy öncesinde PostgreSQL yedeği ve geri yükleme provası zorunludur.
- Müşteriler ayrı deployment, DB, medya hesabı ve domain kullanır; global tenant seçicisi yoktur.
- Typecheck, lint, Vitest, build ve ana HTTP akışları her sürümde doğrulanır.
