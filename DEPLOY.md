# Çiçeksel — Yayına Alma Rehberi (Vercel)

Bu site Next.js 16 (App Router) ile yazıldı. Vercel'de yayınlanmak üzere
hazırlandı: veriler Postgres'te, yüklenen görseller Vercel Blob'da tutulur.

> **Önce oku:** Ödeme sistemi (iyzico) **henüz bağlı değil**. Ödeme sayfası
> şu an demo modunda çalışıyor ve gerçek tahsilat yapmıyor. Bu yüzden
> `ciceksel.com` alan adını bu siteye yönlendirmeden (Adım 6) önce iyzico
> entegrasyonunu bitirmeniz önerilir; aksi halde müşteriler sipariş
> ödemesi yapamaz.

---

## Adım 1 — Kodu GitHub'a yükleyin

```bash
git remote add origin https://github.com/<kullanici>/ciceksel.git
git push -u origin master
```

## Adım 2 — Vercel projesi oluşturun

1. https://vercel.com adresinde hesap açın / giriş yapın.
2. **Add New → Project** → GitHub deposunu seçin (**Import**).
3. Framework otomatik **Next.js** algılanır. Build ayarlarını değiştirmeyin.
4. Henüz **Deploy demeyin** — önce Adım 3-5'teki değişkenleri girin.
   (Deploy ettiyseniz sorun değil; değişkenleri girip yeniden deploy edin.)

## Adım 3 — Veritabanı (Postgres) bağlayın

1. Vercel'de projeye girin → **Storage** sekmesi → **Create Database**.
2. **Neon (Postgres)** seçin, bölge olarak **Frankfurt (eu-central-1)**
   önerilir (Türkiye'ye en yakın).
3. Oluşturunca Vercel `DATABASE_URL` değişkenini projeye otomatik ekler.
   Eklemezse: Neon panelindeki connection string'i kopyalayıp Adım 5'teki
   gibi `DATABASE_URL` olarak girin.

> Tablolar ve 41 ürünlük katalog, site ilk açıldığında **otomatik**
> oluşturulur. Elle SQL çalıştırmanıza gerek yok.

## Adım 4 — Görsel depolama (Blob) bağlayın

1. Yine **Storage** → **Create** → **Blob**.
2. Vercel `BLOB_READ_WRITE_TOKEN` değişkenini otomatik ekler.

> Bu, admin panelinden **yeni** yüklediğiniz fotoğraflar için gerekli.
> Mevcut 39 ürün fotoğrafı `public/` içinde kodla birlikte gider.

## Adım 5 — Yönetici şifresini girin

**Settings → Environment Variables** altına ekleyin:

| Değişken | Değer |
|---|---|
| `ADMIN_KEY` | Uzun, tahmin edilemez bir şifre (örn. parola üreticiden 24+ karakter) |

> **Önemli:** `ADMIN_KEY` tanımlanmazsa `/admin` paneli üretimde tamamen
> kapalı kalır (güvenlik gereği varsayılan şifreye düşmez).

Sonra **Deployments → Redeploy** ile yeniden yayınlayın.

## Adım 6 — Alan adını bağlayın (ciceksel.com)

> ⚠️ Bu adım mevcut ciceksel.com sitesini devre dışı bırakır. iyzico
> entegrasyonu bitmeden yapmayın.

1. Vercel → **Settings → Domains** → `ciceksel.com` ekleyin.
2. Vercel size DNS kayıtlarını gösterir. Alan adı sağlayıcınızın
   panelinde bunları girin:
   - `A` kaydı → `76.76.21.21`
   - `CNAME` (www) → `cname.vercel-dns.com`
3. DNS yayılması 5 dk – 48 saat sürebilir.

---

## Yayın sonrası kontrol listesi

- [ ] `/` açılıyor, katalog ürünleri görünüyor
- [ ] `/katalog` — 41 ürün listeleniyor
- [ ] `/vitrin` — 3D modeller dönüyor
- [ ] `/admin` — `ADMIN_KEY` ile giriş yapılıyor
- [ ] Admin'den ürün ekle → `/katalog`'da görünüyor (veritabanı çalışıyor)
- [ ] Admin'den fotoğraf yükle → görsel açılıyor (Blob çalışıyor)
- [ ] Test siparişi ver → admin panelinde görünüyor

## Ortam değişkenleri özeti

`.env.example` dosyasına bakın. Üretimde zorunlu olanlar:

- `ADMIN_KEY` — yönetici şifresi
- `DATABASE_URL` — Postgres (Vercel Storage otomatik ekler)
- `BLOB_READ_WRITE_TOKEN` — görsel yükleme (Vercel Storage otomatik ekler)

## Yerel geliştirme

Veritabanı olmadan da çalışır: `DATABASE_URL` tanımlı değilse veriler
`data/*.json` dosyalarına, görseller `public/uploads/` klasörüne yazılır.

```bash
npm install
npm run dev
```

Yerel admin şifresi (varsayılan): `ciceksel2026`

## Bilinen eksikler

- **iyzico ödeme entegrasyonu yapılmadı** — ödeme sayfası demo modunda.
- Ürün görselleri ve hakkımızda/iletişim metinleri ciceksel.com'dan
  alınmıştır (bkz. `public/flowers/ATTRIBUTION.md`). Hero'daki iki
  sanatsal görselin (Pinterest kaynaklı) lisansı doğrulanmamıştır;
  yayına almadan önce kendi fotoğraflarınızla değiştirin.
