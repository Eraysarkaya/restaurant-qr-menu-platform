# RESTORAN / KAFE WEB SİTESİ — TAM YIĞIN ÜRETİM ODAKLI PROJE

Bu projede kıdemli full-stack geliştirici ve yazılım mimarı olarak hareket et.

Görevin; restoran, kafe, hamburgerci, tostçu, fast-food işletmesi veya benzeri gerçek bir yemek işletmesi için eksiksiz, profesyonel ve üretim ortamında kullanılabilecek bir web sitesi tasarlamak ve geliştirmektir.

Bu proje basit veya statik bir restoran şablonu DEĞİLDİR.

Tamamlanan proje, gerçek bir restoran sahibine özel olarak uyarlanıp satılabilecek ve işletmenin resmi web sitesi olarak yayınlanabilecek kalitede olmalıdır.

Sistem aşağıdakileri içermelidir:

- Müşterilerin kullanacağı herkese açık web sitesi
- Dinamik menü / ürün sistemi
- Admin kimlik doğrulama sistemi
- Güvenli admin paneli
- Kategori yönetimi
- Ürün yönetimi
- Görsel yükleme ve yönetme
- İşletme bilgilerinin yönetimi
- Çalışma saatlerinin yönetimi
- İletişim ve sosyal medya bilgileri
- Temel SEO özellikleri
- Responsive ve mobile-first tasarım
- Veritabanı kalıcılığı
- Veri doğrulama
- Güvenlik önlemleri
- Hata yönetimi
- Yükleniyor / boş / hata durumları
- Bakımı kolay mimari
- Production ortamına dağıtıma hazır yapı

Restoran sahibinin normal kullanım sırasında değiştirmek isteyebileceği hiçbir önemli içeriği gereksiz şekilde kod içerisine sabitleme.

---

# 1. GELİŞTİRME YAKLAŞIMI

Doğrudan rastgele dosyalar oluşturmaya başlama.

Öncelikle:

1. Tüm gereksinimleri analiz et.
2. Genel mimariyi belirle.
3. Veritabanı şemasını belirle.
4. Uygulama rotalarını belirle.
5. Admin paneli işlevlerini belirle.
6. Müşteri tarafındaki işlevleri belirle.
7. Kısa bir geliştirme planı oluştur.
8. Daha sonra projeyi aşamalı şekilde geliştir.

Geliştirme sırasında:

- Uygulamayı çalışır durumda tut.
- Gereksiz karmaşıklık oluşturma.
- Bakımı kolay, production kalitesine yakın çözümleri tercih et.
- Frontend, backend, doğrulama, veritabanı, authentication ve authorization sorumluluklarını düzgün şekilde ayır.
- Sahte fonksiyonlar oluşturup çalışıyormuş gibi davranma.
- Kritik butonları işlevsiz bırakma.
- Veritabanında tutulması gereken veriler için sahte veya geçici persistence kullanma.
- Önemli özellikleri geliştirdikten sonra test et.
- Bir özelliği tamamlanmış saymadan önce TypeScript, lint, runtime, güvenlik ve build hatalarını düzelt.

Bir konuda belirsizlik varsa gerçek bir küçük veya orta ölçekli restoran için en mantıklı çözümü tercih et.

---

# 2. ÖNERİLEN TEKNOLOJİ YIĞINI

Modern bir full-stack TypeScript mimarisi kullan.

Tercih edilen teknoloji yığını:

- Next.js
- TypeScript
- App Router
- React
- Tailwind CSS
- Uygun yerlerde shadcn/ui
- PostgreSQL
- Prisma ORM
- Veri doğrulama için Zod
- Uygun formlarda React Hook Form
- Admin kullanıcıları için güvenli sunucu taraflı authentication
- Uygun yerlerde Next.js Server Actions ve/veya Route Handlers

Görsel depolama için production ortamına uygun bir yapı kullan.

Tercih edilen seçenekler:

- Cloudinary
- S3 uyumlu depolama
- Supabase Storage

Görsel binary verilerini doğrudan PostgreSQL içerisinde saklama.

Yerel geliştirme için temiz ve environment variable tabanlı yapılandırma oluştur.

Gizli bilgileri client tarafındaki koda açma.

---

# 3. PROJE FELSEFESİ

Her deployment tek bir restoran veya işletmeyi temsil edecektir.

Örnek işletmeler:

- Hamburger restoranı
- Kafe
- Tostçu
- Pizzacı
- Fast-food restoranı
- Küçük aile restoranı

Bununla birlikte mimari, başka bir restoran için logo, işletme bilgileri, menü, renkler, görseller vb. değiştirilerek yeniden kullanılabilecek kadar esnek olmalıdır.

Güçlü bir mimari gerekçe olmadığı sürece tam kapsamlı multi-tenant SaaS sistemi oluşturma.

Mevcut ürün, tek bir restoran sahibine teslim edilen profesyonel web sitesidir.

---

# 4. MÜŞTERİ TARAFI WEB SİTESİ

Modern ve profesyonel bir restoran sitesi oluştur.

Aşağıdaki cihazlarda kusursuza yakın çalışmalıdır:

- Telefon
- Tablet
- Dizüstü bilgisayar
- Masaüstü bilgisayar

Restoran ziyaretçileri çoğunlukla telefondan gireceği için mobil kullanıcı deneyimi özellikle önemlidir.

Önerilen public rotalar:

/
 /menu
 /menu/[category]
 /about
 /contact

Gerekli olduğunda ek rotalar oluşturulabilir.

---

# 5. ANA SAYFA

Profesyonel bir restoran landing page oluştur.

Olası bölümler:

## Header / Navigasyon

İçermesi gerekenler:

- Restoran logosu
- Restoran adı
- Ana Sayfa
- Menü
- Hakkımızda
- İletişim
- Ayarlanmışsa Telefon / WhatsApp CTA
- Mobil menü

Header responsive olmalıdır.

Uygunsa sticky header kullanılabilir.

---

## Hero Bölümü

Dinamik olarak yönetilebilecek içerikler:

- Restoran adı
- Ana başlık
- Kısa açıklama
- Hero görseli
- Birincil CTA
- İkincil CTA

Örnek aksiyonlar:

- Menüyü Gör
- İletişime Geç
- WhatsApp
- Yol Tarifi Al

Mümkün olan hero içerikleri admin tarafından düzenlenebilir olmalıdır.

---

## Öne Çıkan Kategoriler

Örnek:

- Hamburgerler
- Tostlar
- İçecekler
- Tatlılar
- Menüler

Kategoriler tamamen veritabanından gelmelidir.

Arayüz içerisine sabit olarak yazılmamalıdır.

---

## Öne Çıkan Ürünler

Admin kullanıcıları ürünleri "öne çıkan" olarak işaretleyebilmelidir.

Öne çıkan ürünleri dinamik olarak göster.

---

## Hakkımızda Önizlemesi

Restoran hakkında kısa bilgi ve tam Hakkımızda sayfasına bağlantı.

---

## İşletme Bilgileri

Olası bilgiler:

- Adres
- Telefon
- WhatsApp
- E-posta
- Şu anda açık / kapalı durumu
- Çalışma saatleri

---

## Konum

Ayarlanabilir olarak destekle:

- Google Maps bağlantısı
- Uygunsa harita embed bağlantısı
- Yol Tarifi Al butonu

Gereksiz API anahtarlarını açık etmeyi gerektirecek çözümlerden kaçın.

---

## Sosyal Medya

Ayarlanabilir bağlantılar:

- Instagram
- Facebook
- TikTok
- X
- YouTube

Sadece girilmiş olan sosyal medya hesaplarını göster.

---

## Footer

İçermesi gerekenler:

- Restoran adı / logosu
- Hızlı navigasyon
- İletişim bilgileri
- Çalışma saatleri
- Sosyal medya bağlantıları
- Telif hakkı bilgisi

---

# 6. MENÜ SİSTEMİ

Menü, uygulamanın en önemli bölümlerinden biridir.

Tamamen dinamik ve veritabanı tabanlı olmalıdır.

Örnek yapı:

Kategori:

- Hamburgerler
- Tostlar
- Pizzalar
- İçecekler
- Tatlılar
- Menü / Kombolar

Her kategorinin altında ürünler bulunur.

---

# 7. KATEGORİ VERİ MODELİ

Bir kategori yaklaşık olarak şu alanları desteklemelidir:

- id
- name
- slug
- description
- image
- sortOrder
- isActive
- createdAt
- updatedAt

Gereksinimler:

- Kategori eklenebilmeli.
- Kategori düzenlenebilmeli.
- Kategori güvenli şekilde silinebilmeli.
- Kategori aktif / pasif yapılabilmeli.
- Kategorilerin sırası değiştirilebilmeli.
- Slug değerleri URL uyumlu olmalı.
- Tekrarlanan veya geçersiz veri engellenmeli.

İçerisinde ürün bulunan bir kategori silindiğinde ürünleri sessizce yok etme.

Güvenli bir yöntem kullan:

- Ürünler taşınana veya silinene kadar kategori silmeyi engelle,

veya

- Açık şekilde belirtilmiş yıkıcı bir işlem talep et.

Daha güvenli olan yaklaşımı tercih et.

---

# 8. ÜRÜN VERİ MODELİ

Her ürün yaklaşık olarak şu alanları desteklemelidir:

- id
- name
- slug
- description
- Gerekliyse shortDescription
- price
- image
- categoryId
- isActive
- isFeatured
- isAvailable
- sortOrder
- createdAt
- updatedAt

İsteğe bağlı production dostu alanlar:

- oldPrice
- badge
- spiceLevel
- calories
- preparationNote

Ancak uygulamayı gereksiz yere karmaşıklaştırma.

Fiyat verisini güvenilir olmayan floating-point veri türüyle saklama.

Para için uygun decimal veya money-safe veri yapısı kullan.

---

# 9. ÜRÜN DAVRANIŞLARI

Admin aşağıdaki işlemleri gerçekleştirebilmelidir:

- Ürün oluşturma
- Ürün düzenleme
- Ürün silme
- Ürün görseli yükleme / değiştirme
- Kategori seçme
- Fiyat değiştirme
- Açıklama değiştirme
- Aktif / pasif yapma
- Mevcut / tükenmiş yapma
- Öne çıkan / normal yapma
- Görüntülenme sırasını değiştirme

Tükenmiş ürünlerin tamamen kaybolması gerekmez.

Uygun bir "Şu anda mevcut değil" veya "Tükendi" göstergesiyle görünmeye devam edebilir.

Pasif ürünler public sitede gösterilmemelidir.

---

# 10. MENÜ ARAYÜZÜ

Restoran kullanımına uygun bir menü arayüzü oluştur.

Olası özellikler:

- Kategori sekmeleri
- Kategori filtreleri
- Ürün kartları
- Ürün görselleri
- Ürün adı
- Açıklama
- Fiyat
- Mevcut / tükenmiş durumu
- Uygunsa öne çıkan etiketi

Küçük ekranlarda rahatça gezilebilir olmalıdır.

Gerekmediği sürece karmaşık e-ticaret arayüzü oluşturma.

Ana amaç restoran ürünlerini temiz ve iştah açıcı şekilde sunmaktır.

---

# 11. ARAMA

Menü büyüklüğü gerektiriyorsa basit bir ürün arama sistemi oluştur.

Arama, ilgili ürün isimlerini bulabilmelidir.

Küçük restoran sitesi için gereksiz full-text arama altyapısı oluşturma.

---

# 12. ONLINE SİPARİŞ KAPSAMI

İlk sürümde özellikle talep edilmediği sürece karmaşık ödeme veya e-ticaret sistemi oluşturma.

İlk sürümün ana amacı:

- Restoran tanıtımı
- Dinamik menü
- Müşteri iletişimi
- Restoranın bulunabilirliği
- İsteğe bağlı WhatsApp sipariş / iletişim özelliği

Ürünlerde isteğe bağlı şu tarz CTA olabilir:

"WhatsApp'tan Sipariş Ver"

Bu özellik uygulanırsa seçilen ürünün adını içeren uygun WhatsApp mesajı oluştur.

Bu özelliği ayarlanabilir yap.

Daha sonraki bir aşamada açıkça istenmediği sürece Stripe veya benzeri ödeme altyapısı kurma.

Ancak mimari gelecekte online sipariş sistemi eklenmesini engellememelidir.

---

# 13. ADMIN PANELİ

Ayrı bir admin alanı oluştur.

Önerilen rota:

/admin

Alt rotalar yaklaşık olarak:

/admin
/admin/products
/admin/products/new
/admin/products/[id]
/admin/categories
/admin/settings
/admin/opening-hours
/admin/profile

Profesyonel dashboard düzeni kullan.

İçermesi gerekenler:

- Masaüstünde sidebar
- Mobil admin navigasyonu
- Üst navigasyon/header
- Kullanıcı / hesap kontrolleri
- Çıkış yapma

---

# 14. ADMIN DASHBOARD

Dashboard yararlı özet bilgiler sunmalıdır.

Örnek kartlar:

- Toplam ürün sayısı
- Aktif ürün sayısı
- Mevcut olmayan ürün sayısı
- Kategori sayısı
- Öne çıkan ürün sayısı

İsteğe bağlı:

- Son düzenlenen ürünler

Sahte analytics oluşturma.

Gerçek ziyaretçi analytics altyapısı yoksa sahte ziyaretçi, sipariş veya gelir grafikleri gösterme.

---

# 15. ÜRÜN YÖNETİMİ

Ürün yönetim listesi / tablosu şunları göstermelidir:

- Görsel küçük resmi
- Ürün adı
- Kategori
- Fiyat
- Mevcudiyet durumu
- Aktiflik durumu
- Öne çıkarılmış durumu
- Düzenle
- Sil

Yararlı özellikler:

- Arama
- Kategori filtresi
- Durum filtresi
- Sıralama
- Gerekirse pagination

Veri miktarı küçükse pagination sistemini gereksiz yere karmaşıklaştırma.

---

# 16. KATEGORİ YÖNETİMİ

Admin şunları yapabilmelidir:

- Kategori oluşturma
- Kategori adını değiştirme
- Görsel ekleme / değiştirme
- Açıklama düzenleme
- Aktif / pasif yapma
- Sıralama değiştirme
- Güvenli şekilde silme

Yıkıcı işlemler için iyi kullanıcı deneyimi sağla.

Onay dialogları kullan.

---

# 17. RESTORAN AYARLARI

Restoran / işletme ayarları bölümü oluştur.

Restoran sahibi aşağıdakileri yönetebilmelidir:

## Genel

- Restoran adı
- Kısa açıklama
- Uzun açıklama
- Logo
- Destekleniyorsa favicon
- Hero başlığı
- Hero alt başlığı
- Hero görseli

## İletişim

- Telefon
- WhatsApp numarası
- E-posta
- Adres

## Konum

- Google Maps bağlantısı
- İsteğe bağlı harita embed ayarı

## Sosyal Medya

- Instagram
- Facebook
- TikTok
- YouTube
- X

## CTA Ayarları

İlgili iletişim butonlarının aktif / pasif yapılmasına izin ver.

Boş alanları public tarafta gösterme.

---

# 18. ÇALIŞMA SAATLERİ

Düzenlenebilir çalışma saatleri sistemi oluştur.

Haftanın yedi gününü destekle.

Her gün yaklaşık olarak:

- day
- isClosed
- openTime
- closeTime

alanlarına sahip olabilir.

Örnek:

Pazartesi — 09:00–23:00
Salı — 09:00–23:00
Pazar — Kapalı

Public sitede çalışma saatlerini düzgün şekilde göster.

Mantıklıysa şunları hesapla:

- Şu anda açık
- Kapalı
- XX:XX'de açılıyor

Timezone ayarını dikkate al.

Restoranın timezone bilgisi ayarlanabilir olmalıdır ve mantıklı varsayılan kullanılmalıdır.

Sunucunun timezone'u nedeniyle yanlış "Açık" bilgisi gösterme.

---

# 19. ADMIN KİMLİK DOĞRULAMA

Admin paneli herkese açık OLMAMALIDIR.

Doğru bir authentication sistemi oluştur.

Gereksinimler:

- Giriş ekranı
- Kimlik bilgileri yerel tutuluyorsa güvenli parola saklama
- Sunucu taraflı session doğrulama
- Çıkış yapma
- Korunan admin rotaları
- Server-side mutation işlemlerinde authorization kontrolü
- Sadece arayüzde buton gizlemeye güvenmeme

Authorization konusunda browser/client tarafına güvenme.

Kötü niyetli biri endpoint'i doğrudan çağırdığında da reddedilmelidir.

---

# 20. ADMIN KULLANICI MODELİ

İlk deployment için tek admin yeterlidir.

Ancak model gelecekte roller eklenebilecek kadar temiz tasarlanmalıdır.

Örnek alanlar:

- id
- name
- email
- Yerel auth kullanılıyorsa passwordHash
- role
- createdAt
- updatedAt

Olası rol:

ADMIN

Gereksiz kurumsal RBAC sistemi oluşturma.

---

# 21. GÜVENLİK GEREKSİNİMLERİ

Güvenlik önemli bir gereksinimdir.

Aşağıdakilere karşı uygun koruma uygula:

- Yetkisiz admin erişimi
- Broken access control
- SQL Injection
- XSS
- Gerekli durumlarda CSRF
- Geçersiz veri
- Zararlı dosya yükleme
- Zararlı URL girişleri
- Mass assignment
- Secret bilgilerinin yanlışlıkla açığa çıkması
- Veritabanı bilgilerinin sızması
- Production hata detaylarının kullanıcıya gösterilmesi
- Mantıklı ölçüde brute-force giriş denemeleri

Önemli kurallar:

- Veriyi sunucu tarafında doğrula.
- Sadece client-side validation yeterli değildir.
- Zod veya benzer server-side şemalar kullan.
- Prisma'yı güvenli şekilde kullan.
- Kullanıcı girdisinden dinamik raw SQL oluşturma.
- Admin mutation işlemlerini koru.
- Yüklenen görsellerin MIME türünü doğrula.
- Görsel boyutunu doğrula.
- Güvenli dosya isimleri oluştur veya storage servisinin oluşturduğu ID'leri kullan.
- Bir dosyanın uzantısına bakarak dosyayı güvenilir kabul etme.
- Bilerek yapılmadığı sürece environment variable değerlerini client'a açma.
- Password hash değerlerini hiçbir zaman istemciye gönderme.
- Gereksiz database alanlarını API üzerinden döndürme.
- Production ortamında güvenli cookie / session ayarları kullan.
- Kullanıcının kontrol ettiği metinleri uygun şekilde escape / sanitize et.

Rich text editörü gerekmiyorsa güvenlik karmaşıklığını azaltmak için düz metin alanlarını tercih et.

---

# 22. GİRİŞ KORUMASI

Admin login sistemi için mantıklı brute-force koruması ekle.

Olası çözümler:

- Rate limiting
- Geçici gecikme / kilitleme
- Uygunsa IP tabanlı koruma

Ancak yanlışlıkla restoran sahibini kalıcı olarak sistemden kilitleme.

Sistem küçük işletme için pratik kalmalıdır.

---

# 23. FORM DOĞRULAMA

Önemli formlarda aşağıdakileri sağla:

- Zorunlu alan kontrolü
- Maksimum karakter sınırları
- Geçerli URL kontrolü
- Geçerli e-posta kontrolü
- Telefon numarası doğrulama
- Fiyat doğrulama
- Anlaşılır hata mesajları

Uygun yerlerde client-side doğrulama yap ancak server-side doğrulamayı daima uygula.

---

# 24. GÖRSEL YÖNETİMİ

Restoran sitesi için görseller çok önemlidir.

Destekle:

- Ürün görselleri
- Kategori görselleri
- Restoran logosu
- Hero görseli

Sağlanması gerekenler:

- Uygunsa yükleme progress / loading feedback
- Önizleme
- Görsel değiştirme
- Görsel kaldırma
- Dosya boyutu limiti
- Kabul edilen MIME türleri

Önerilen formatlar:

- JPEG
- PNG
- WebP

Altyapı uygunsa AVIF desteklenebilir.

Public görselleri optimize et.

Next.js image optimization sistemini uygun şekilde kullan.

Gereksiz yere dev boyuttaki orijinal görselleri yükleme.

---

# 25. VERİTABANI TASARIMI

Temiz ve ilişkisel bir veritabanı şeması oluştur.

Beklenen temel entity'ler:

- AdminUser
- RestaurantSettings
- Category
- Product
- OpeningHour

Gerekçesi varsa ek entity'ler oluşturulabilir.

İlişkiler açık ve güvenli olmalıdır.

Kullan:

- Primary key
- Foreign key
- Unique constraint
- Gereken yerlerde index
- Mantıklı cascade davranışı

Önemli restoran verilerini dikkatsizce cascade delete ile silme.

---

# 26. VERİTABANI SEED

Development seed script oluştur.

Gerçekçi örnek veriler ekle.

Örnek restoran:

"Köşe Mutfak"

Kategoriler:

- Hamburgerler
- Tostlar
- İçecekler
- Tatlılar

Birkaç gerçekçi ürün oluştur.

Örnek çalışma saatleri oluştur.

Development admin hesabını güvenli şekilde oluştur.

Gerçek şifreleri veya production secret bilgilerini repoya commit etme.

Development admin parolası gerekiyorsa environment variable üzerinden al veya yalnızca geliştirme ortamına özel olduğunu açık şekilde belirt.

---

# 27. KULLANICI DENEYİMİ GEREKSİNİMLERİ

Uygulama profesyonel hissettirmelidir.

Şunlara dikkat et:

- Tipografi
- Tutarlı boşluklar
- Görsel hiyerarşi
- Buton durumları
- Hover durumları
- Focus durumları
- Loading durumları
- Empty state
- Error state
- Form hata mesajları
- Başarılı işlem bildirimleri
- Yıkıcı işlemlerde onay
- Mobil uyumluluk
- Dokunmatik ekran için uygun buton boyutları

Kaçınılması gerekenler:

- Gereksiz dev gradientler
- Fazla animasyon
- Şablon gibi duran karmaşık tasarımlar
- Kart içerisinde kart içerisinde kart yapıları
- Tipik jenerik AI dashboard görünümü
- Her şeyi gereksiz şekilde yuvarlatılmış kutuya dönüştürme
- Anlamsız ikonlar

Public restoran sitesi modern, sıcak, iştah açıcı ve kolay kullanılabilir görünmelidir.

---

# 28. ERİŞİLEBİLİRLİK

Temel accessibility gereksinimlerini uygula.

Şunları kullan:

- Semantic HTML
- Uygun form label'ları
- Klavye ile kullanım
- Görünür focus indicator
- Yeterli renk kontrastı
- Alt text
- Erişilebilir dialog yapısı
- Doğru heading hiyerarşisi

Önemli fonksiyonları sadece fare ile kullanılabilir yapma.

---

# 29. SEO

Restoran siteleri için arama motoru görünürlüğü önemlidir.

Temel teknik SEO uygula.

İçermesi gerekenler:

- Dinamik sayfa title'ları
- Meta description
- Gerektiğinde canonical
- Open Graph metadata
- Uygunsa Twitter / sosyal metadata
- robots.txt
- sitemap.xml
- Semantic HTML

Restoran verilerini dinamik kullan.

Mantıklıysa Schema.org structured data ekle.

Özellikle:

Restaurant
veya
FoodEstablishment

structured data kullanılabilir.

Olası alanlar:

- Name
- Address
- Telephone
- Opening hours
- URL
- Logo
- Social profiles

Structured data gerçek ayarlanmış bilgilerle eşleşmelidir.

---

# 30. PERFORMANS

Public site hızlı olmalıdır.

Dikkat edilmesi gerekenler:

- Görsel optimizasyonu
- Lazy loading
- Server rendering
- Cache stratejisi
- Gereksiz JavaScript kullanımını azaltma
- Veritabanı sorgu performansı
- N+1 query sorunlarından kaçınma
- Bundle boyutu

Her şeyi gereksiz yere client component yapma.

Uygun olan yerlerde varsayılan olarak server component kullan.

Client component sadece interactivity gerektiğinde kullanılmalıdır.

---

# 31. CACHE VE VERİ GÜNCELLİĞİ

Admin tarafından yapılan değişiklikler public sitede güvenilir şekilde görünmelidir.

Restoran sahibinin ürün fiyatını değiştirdiği halde uzun süre eski fiyatı görmesine neden olacak yanlış cache sistemi oluşturma.

Admin mutation işlemlerinden sonra uygun Next.js revalidation / cache invalidation stratejisi kullan.

---

# 32. HATA YÖNETİMİ

Hataları bilinçli şekilde yönet.

Örnekler:

- Veritabanı erişilemiyor
- Ürün bulunamadı
- Kategori bulunamadı
- Geçersiz form
- Görsel yükleme başarısız
- Yetkisiz istek
- Network hatası

Public kullanıcılar anlaşılır mesajlar görmelidir.

Admin kullanıcılar sorunu çözmeye yardımcı olacak geri bildirim almalıdır.

Production ortamında stack trace veya secret gösterme.

---

# 33. 404 SAYFALARI

Kaliteli 404 davranışı oluştur.

Özellikle bulunamayan:

- Ürün
- Kategori
- Public sayfa
- Admin kaynağı

için framework'e uygun not-found handling kullan.

---

# 34. LOADING DURUMLARI

Uygun yerlerde kullan:

- Skeleton
- Spinner
- Disabled button
- Submission state

Formların iki kez gönderilmesini engelle.

---

# 35. YIKICI İŞLEMLER

Ürün veya kategori silme gibi işlemlerde:

- Onay iste.
- Kullanıcıya ne olacağını açıkça söyle.
- Çift gönderimi engelle.

Profesyonel dialog bileşeni varken tarayıcı `confirm()` kullanımını final çözüm olarak kullanma.

---

# 36. RESPONSIVE ADMIN PANELİ

Admin kullanıcının her zaman masaüstü bilgisayar kullanacağını varsayma.

Restoran sahibi telefonundan:

- fiyat değiştirmek,
- ürünü tükenmiş yapmak,
- bilgi güncellemek

isteyebilir.

Bu nedenle admin paneli mobil cihazlarda da düzgün çalışmalıdır.

Örneğin:

- Mobil navigasyon
- Responsive tablo veya kart yapısı
- Dokunmatik ekran dostu aksiyonlar
- Küçük ekranlara uygun formlar

---

# 37. RESTORAN MARKA AYARLARI

Marka bilgilerini kaynak kodun farklı yerlerine dağıtma.

Marka ve restoran ayarlarını merkezi şekilde yönet.

Ayarlanabilir özellikler:

- Ana marka rengi
- İkincil / accent rengi
- Restoran logosu
- Restoran adı

Ancak karmaşık bir page builder oluşturma.

Özelleştirmeyi kontrollü ve güvenilir tut.

---

# 38. ENVIRONMENT VARIABLES

`.env.example` oluştur.

Gerekli tüm değişkenleri dokümante et.

Olası değişkenler:

DATABASE_URL
AUTH_SECRET
IMAGE_STORAGE_*
APP_URL
ADMIN_BOOTSTRAP_EMAIL
ADMIN_BOOTSTRAP_PASSWORD

Gerçek secret değerlerini commit etme.

---

# 39. PROJE DOSYA YAPISI

Temiz feature-oriented veya domain-oriented yapı kullan.

Örnek:

src/
  app/
  components/
  features/
  lib/
  server/
  validations/
  types/

prisma/
  schema.prisma
  seed.ts

public/

Next.js kuralları daha temiz bir yapı öneriyorsa bu örneğe birebir bağlı kalmak zorunda değilsin.

Her şeyi:

components/
utils/

klasörlerine doldurma.

Kodları sorumluluğa göre düzenle.

---

# 40. YENİDEN KULLANILABİLİR BİLEŞENLER

Yaygın UI desenleri için yeniden kullanılabilir component'ler oluştur.

Örnek:

- ProductCard
- CategoryNavigation
- EmptyState
- FormField
- ConfirmDialog
- ImageUploader
- PriceDisplay
- AdminPageHeader
- StatusBadge

Ancak sadece bir kez kullanılan basit markup'ları gereksiz yere soyutlama.

---

# 41. PARA BİÇİMLENDİRME

Fiyatları doğru formatla.

Restoran para birimi ayarlanabilir olmalıdır.

İlk varsayılan:

TRY
₺

Örnek:

₺249,90

Her yerde manuel string birleştirme yapma.

`Intl.NumberFormat` kullanarak merkezi fiyat formatlama sistemi oluştur.

---

# 42. DİL / LOCALE HAZIRLIĞI

İlk site Türkçe olabilir.

Ancak:

- Gelecekte localization yapılmasını imkânsızlaştıracak şekilde kodlama yapma.
- Public taraftaki sabit metinleri gerektiğinde merkezi tut.
- Tarih / saat / fiyat formatında locale-aware yöntemler kullan.

Açıkça istenmediği sürece tam kapsamlı enterprise translation sistemi oluşturma.

---

# 43. TÜRKİYE RESTORAN BAĞLAMI

İlk örnek işletme Türkiye'de olacaktır.

Türkiye'deki restoran kullanım alışkanlıklarını dikkate al.

Örnekler:

- TRY para birimi
- WhatsApp iletişimi
- Instagram
- Google Maps yol tarifi
- Türkiye telefon numaraları
- Türkçe locale
- Mobile-first ziyaretçiler

Örnek kategoriler:

- Hamburgerler
- Tostlar
- Atıştırmalıklar
- Tatlılar
- Sıcak İçecekler
- Soğuk İçecekler
- Menüler

Ancak kategoriler tamamen dinamik olmalıdır.

---

# 44. AUDIT ALANLARI

Önemli entity'lerde şu alanlar bulunmalıdır:

- createdAt
- updatedAt

Bunlar yönetim ve bakım için yararlıdır.

Tam kapsamlı audit log sistemi ilk sürüm için zorunlu değildir.

---

# 45. ADMIN AYAR GÜVENLİĞİ

Restoran ayarları güncellenirken admin'in rastgele güvensiz HTML veya script ekleyebilmesine izin verme.

Kesinlikle gerekmiyorsa raw HTML alanı oluşturma.

Kontrollü form alanlarını tercih et.

---

# 46. TESTLER

Önemli iş mantıkları için anlamlı testler yaz.

En azından kritik alanları kapsa:

- Validation
- Authentication / authorization
- Ürün oluşturma / güncelleme
- Kategori davranışları
- Para işlemleri
- Korunan endpoint / action'lar

Seçilen teknoloji yığınına uygun test araçlarını kullan.

Sadece test coverage rakamını artırmak için onlarca anlamsız snapshot testi oluşturma.

---

# 47. MANUEL FONKSİYON TESTLERİ

Projeyi tamamlanmış saymadan önce ana kullanıcı akışlarını kontrol et.

PUBLIC:

1. Ana sayfa açılıyor.
2. Menü açılıyor.
3. Kategoriler görüntüleniyor.
4. Ürünler doğru gösteriliyor.
5. Pasif ürünler görünmüyor.
6. Tükenmiş ürünler doğru şekilde gösteriliyor.
7. Mobil navigasyon çalışıyor.
8. İletişim aksiyonları çalışıyor.

ADMIN:

1. Admin giriş yapabiliyor.
2. Yetkisiz kullanıcı admin alanına giremiyor.
3. Admin kategori oluşturabiliyor.
4. Admin ürün oluşturabiliyor.
5. Ürün public sitede görünüyor.
6. Admin fiyat değiştirebiliyor.
7. Yeni fiyat public sitede görünüyor.
8. Admin ürünü tükenmiş yapabiliyor.
9. Public site bunu doğru gösteriyor.
10. Admin ürün görselini değiştirebiliyor.
11. Admin restoran bilgilerini değiştirebiliyor.
12. Admin çalışma saatlerini değiştirebiliyor.
13. Admin ürünü güvenli şekilde silebiliyor.
14. Admin çıkış yapabiliyor.

---

# 48. GÜVENLİK İNCELEMESİ

Projeyi tamamlamadan önce özellikle şu konuları incele:

- Korunmamış admin mutation işlemleri
- Açığa çıkan secret değerleri
- Sadece client-side authorization
- Güvensiz görsel yükleme
- Doğrulanmamış server input
- Parola saklama yöntemi
- Session güvenliği
- Güvensiz redirect
- XSS açıkları
- Admin verilerinin yanlışlıkla public olması
- Production debug çıktıları

Bulunan sorunları düzelt.

---

# 49. KOD KALİTESİ

Gereksinimler:

- Uygun ölçüde Strict TypeScript
- `any` kullanımından kaçın
- Açık isimlendirme
- Küçük ve odaklı fonksiyonlar
- Devasa component'lerden kaçın
- Business logic tekrarından kaçın
- Domain mantığını gerektiğinde görsel component'lerden ayır
- Yorumlarda "ne yaptığını" değil gerektiğinde "neden yaptığını" açıkla
- Ölü kodları temizle
- Terk edilmiş deneysel dosyaları sil
- Import'ları düzenli tut
- Build başarılı olsun diye gerçek hataları bastırma

Şunu kullanma:

// @ts-ignore

Gerçekten gerekçeli ve dokümante edilmiş özel bir durum yoksa.

---

# 50. README

Profesyonel bir README oluştur.

Açıklanması gerekenler:

- Projenin amacı
- Özellikler
- Teknoloji yığını
- Gereksinimler
- Yerel kurulum
- Environment kurulumu
- Veritabanı kurulumu
- Prisma migration
- Seed işlemi
- Development server çalıştırma
- Production build
- Admin bootstrap süreci
- Görsel depolama ayarları
- Deployment bilgileri

Yeni bir geliştirici repoyu clone ettikten sonra sadece README'yi okuyarak projeyi çalıştırabilmelidir.

---

# 51. DEPLOYMENT

Proje dağıtıma hazır olmalıdır.

Mantıklı deployment mimarisi:

Uygulama:
- Vercel

Veritabanı:
- Neon
- Supabase PostgreSQL
- Railway PostgreSQL
- veya standart başka bir PostgreSQL sağlayıcısı

Görseller:
- Cloudinary
- S3 uyumlu servis
- Supabase Storage

Mümkün olduğunca projeyi tek bir sağlayıcıya sıkı şekilde bağlama.

Deployment adımlarını dokümante et.

---

# 52. YEDEKLEME VE OPERASYONEL KONULAR

Bu web sitesi gerçek işletme tarafından kullanılabileceği için dokümantasyonda production tavsiyeleri belirt:

- Veritabanı yedekleri
- Environment variable güvenliği
- HTTPS
- Admin parolasını periyodik değiştirme
- Destekleniyorsa storage backup / versioning
- Dependency güncellemeleri

Ancak uygulamanın içerisine karmaşık backup sistemi geliştirmek zorunda değilsin.

---

# 53. GELECEKTE GENİŞLETİLEBİLİRLİK

Mimari gelecekte şunların eklenmesine izin vermelidir:

- Online sipariş
- Sepet
- Teslimat bölgeleri
- Masa rezervasyonu
- Kampanyalar
- Kuponlar
- Farklı ürün boyutları
- Ürün ekstraları
- Alerjen bilgileri
- Çoklu dil
- Birden fazla admin hesabı
- Analytics
- QR menü
- Birden fazla şube

Ancak:

Bunların hepsini şu anda geliştirme.

Temel mimari ileride bunları eklemek için projenin tamamen yeniden yazılmasını gerektirmemelidir.

---

# 54. İLK SÜRÜMÜN KAPSAMI DIŞINDA

Daha sonra açıkça istenmediği sürece şunları oluşturma:

- Karmaşık e-ticaret checkout
- Kredi kartı ödeme
- Kurye konum takibi
- POS entegrasyonu
- Stok ERP sistemi
- Muhasebe sistemi
- Multi-restoran SaaS tenancy
- Karmaşık sadakat programı
- AI chatbot
- Gerçek zamanlı teslimat takibi
- Native mobil uygulama

Kapsamı gereksiz yere büyütme.

---

# 55. TASARIM YÖNÜ

Public site:

Modern restoran markası hissi vermeli.

Hedefle:

- Kaliteli yemek görselleri
- Güçlü tipografi
- Ferah boşluklar
- Temiz menü sunumu
- İyi görsel hiyerarşi
- Sıcak restoran atmosferi
- Premium ancak ulaşılabilir görünüm

Site standart bir geliştirici dashboard'u gibi görünmemeli.

Admin:

- Temiz
- Pratik
- Hızlı
- Karmaşık olmadan bilgi yoğun
- Teknik bilgisi olmayan restoran sahibinin kullanabileceği kadar kolay

Public site ve admin panelinin kullanım amaçları farklı olduğu için tasarım anlayışları da buna uygun olmalıdır.

---

# 56. GERÇEKÇİ ÖRNEK İÇERİKLER

Geliştirme sırasında Lorem Ipsum yerine gerçekçi Türkçe örnek içerikler kullan.

Örnek restoran:

"Köşe Mutfak"

Örnek kategoriler:

Hamburgerler
Tostlar
Menüler
Tatlılar
Soğuk İçecekler

Örnek ürünler:

Klasik Burger
Cheeseburger
Double Burger
Karışık Tost
Kaşarlı Tost
Patates Kızartması
San Sebastian Cheesecake
Ayran
Kola
Limonata

Bunlar sadece seed / demo verileridir.

Final uygulamada bunların tamamı admin panelinden değiştirilebilir olmalıdır.

---

# 57. ÖNEMLİ DİNAMİK İÇERİK KURALI

Restoran sahibinin yazılımcı olmadığını varsay.

Restoran sahibi günlük işlemleri gerçekleştirmek için kaynak kodu düzenlemek zorunda KALMAMALIDIR.

Admin paneli üzerinden şunları değiştirebilmelidir:

- Ürün adı
- Ürün açıklaması
- Ürün fiyatı
- Ürün görseli
- Ürün mevcudiyet durumu
- Ürün görünürlüğü
- Öne çıkan ürünler
- Kategoriler
- Kategori sırası
- Restoran telefonu
- WhatsApp numarası
- Adres
- Sosyal medya bağlantıları
- Çalışma saatleri
- Hero içeriği
- Restoran açıklaması

Bu proje için temel gereksinimdir.

---

# 58. ADMIN PANELİ BASİTLİĞİ

Restoran sahibi bir yazılımcı değil, işletmecidir.

Bu nedenle formlar ve kontroller anlaşılır Türkçe ifadeler kullanmalıdır.

İyi:

"Ürünü Yayında Göster"

Şundan daha iyidir:

"isActive"

İyi:

"Şu anda satışta mı?"

Database terminolojisini doğrudan kullanıcıya göstermeyin.

Teknik alan isimleri kod içerisinde kalmalıdır.

---

# 59. ADMIN GERİ BİLDİRİMLERİ

Şu işlemlerden sonra:

- Ürün eklendi
- Ürün güncellendi
- Ürün silindi
- Kategori eklendi
- Ayarlar kaydedildi

net success / error bildirimleri göster.

Admin kullanıcı yaptığı işlemin gerçekleşip gerçekleşmediğini tahmin etmek zorunda kalmamalıdır.

---

# 60. UYGULAMA GELİŞTİRME SIRASI

Yaklaşık olarak şu sırayı takip et:

AŞAMA 1 — TEMEL

- Proje kurulumu
- TypeScript / configuration
- Veritabanı
- Prisma
- Environment validation
- Temel layout
- Design system

AŞAMA 2 — VERİ MODELİ

- Restoran ayarları
- Kategoriler
- Ürünler
- Çalışma saatleri
- Admin kullanıcı
- Migration
- Seed

AŞAMA 3 — PUBLIC WEB SİTESİ

- Header
- Ana sayfa
- Menü
- Kategoriler
- Ürün kartları
- Hakkımızda
- İletişim
- Footer
- Responsive yapı

AŞAMA 4 — AUTHENTICATION

- Admin login
- Session
- Protected route
- Authorization

AŞAMA 5 — ADMIN PANELİ

- Dashboard
- Kategori CRUD
- Ürün CRUD
- Görsel yönetimi
- Restoran ayarları
- Çalışma saatleri

AŞAMA 6 — KALİTE

- Validation
- Error state
- Loading state
- Empty state
- Accessibility
- SEO
- Responsive iyileştirmeleri

AŞAMA 7 — GÜVENLİK

- Güvenlik incelemesi
- Upload validation
- Authorization incelemesi
- Rate limiting
- Secret incelemesi

AŞAMA 8 — TEST

- Otomatik testler
- Manuel temel kullanıcı akışları
- Production build
- Lint
- Type-check

AŞAMA 9 — DOKÜMANTASYON

- README
- .env.example
- Deployment rehberi

Önceki aşamada ciddi hatalar varken sonraki aşamaya geçme.

---

# 61. PROJENİN TAMAMLANMIŞ SAYILMA KRİTERLERİ

Ana sayfanın güzel görünmesi projeyi tamamlanmış yapmaz.

Proje ancak aşağıdakiler çalıştığında tamamlanmış sayılır:

- Public restoran sitesi çalışıyor
- Menü veritabanından geliyor
- Admin login güvenli
- Admin rotaları korunuyor
- Ürün CRUD çalışıyor
- Kategori CRUD çalışıyor
- Görseller yönetilebiliyor
- Restoran ayarları değiştirilebiliyor
- Çalışma saatleri değiştirilebiliyor
- Admin değişiklikleri public tarafta doğru şekilde görünüyor
- Validation mevcut
- Güvenlik önlemleri mevcut
- Mobil tasarım çalışıyor
- Error / loading / empty state'ler mevcut
- Temel SEO mevcut
- Database migration çalışıyor
- Development seed çalışıyor
- TypeScript kontrolü başarılı
- Lint başarılı
- Production build başarılı
- Kritik fonksiyonlar test edilmiş
- README tamamlanmış
- Proje gerçekçi şekilde deploy edilebilir durumda

---

# 62. ÖNEMLİ MÜHENDİSLİK KURALLARI

Projenin tamamı boyunca:

1. Çalışmayan özelliği tamamlanmış gibi gösterme.
2. Dinamik olması gereken restoran verilerini gereksiz yere hardcode etme.
3. Güvenlik için frontend kontrolüne güvenme.
4. Secret bilgilerini açığa çıkarma.
5. Verileri dikkatsizce silme.
6. Daha hızlı ilerlemek için TypeScript hatalarını görmezden gelme.
7. Büyük dependency'leri gerekçe olmadan ekleme.
8. Karmaşık ve akıllıca görünen çözümler yerine basit ve güvenilir çözümleri tercih et.
9. Her public ve admin özelliğinde mobil kullanıcı deneyimini düşün.
10. Gerçek bir restoran sahibinin sistemi nasıl kullanacağını düşün.
11. Kod tabanını gelecekte başka geliştiricilerin sürdürebileceği şekilde tut.
12. Önemli mimari kararları dokümante et.
13. Mimari değiştiğinde ilgili dokümantasyonu güncelle.
14. Önemli değişikliklerden sonra uygulamayı test et.

---

# 63. BAŞLANGIÇ TALİMATI

Öncelikle mevcut workspace'i incele.

Eğer henüz proje oluşturulmamışsa:

1. Nihai teknik mimariyi öner.
2. Planlanan klasör yapısını göster.
3. Veritabanı entity ve ilişkilerini tanımla.
4. Public rotaları listele.
5. Admin rotalarını listele.
6. Authentication yaklaşımını açıkla.
7. Görsel depolama stratejisini açıkla.
8. Ana güvenlik kararlarını açıkla.
9. Uygulama geliştirme checklist'i oluştur.

Ardından Aşama 1'e başla.

Eğer mevcut bir proje varsa:

1. Önce önemli mevcut dosyaları incele.
2. Nelerin zaten bulunduğunu açıkla.
3. Mimari, güvenlik ve kod kalitesi sorunlarını belirle.
4. İyi yapılmış mevcut kodları koru.
5. Sadece gerekliyse refactor yap.
6. Mevcut duruma göre geliştirme checklist'i oluştur.
7. Projeyi aşamalı şekilde geliştirmeye devam et.

Gerekli olduğunda proje dosyalarını oluşturabilir, düzenleyebilir, taşıyabilir ve silebilirsin.

Geçici demo hazırlayan bir asistan gibi değil, ürünü para ödeyen gerçek bir restoran müşterisine teslim etmekten sorumlu kıdemli yazılım mühendisi gibi hareket et.