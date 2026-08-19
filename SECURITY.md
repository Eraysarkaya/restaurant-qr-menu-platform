# Güvenlik

## Gizli bilgiler

- `.env` dosyaları, gerçek veritabanı adresleri, parolalar ve Cloudinary anahtarları repoya eklenmemelidir.
- Yalnızca güvenli örnek değerler içeren `.env.example` sürüm kontrolünde tutulur.
- Bootstrap hesapları ilk kurulumdan sonra değiştirilmeli ve production ortam değişkenlerinden kaldırılmalıdır.

## Bildirim

Bir güvenlik açığı fark ederseniz ayrıntıları herkese açık issue olarak paylaşmayın. Depo sahibine GitHub profili üzerinden özel olarak ulaşın.

## Production kontrolü

Production kurulumu öncesinde güçlü ve benzersiz secret değerleri, HTTPS, güvenli cookie ayarları, veritabanı yedeği, Cloudinary kısıtları ve bağımlılık güncellemeleri ayrıca doğrulanmalıdır.
