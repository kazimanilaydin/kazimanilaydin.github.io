# Profil sayfası kurulumu

Bu klasör, `kazimanilaydin` GitHub profilinin README'si için hazırlandı. GitHub profil
sayfası yalnızca **`kazimanilaydin/kazimanilaydin`** reposundaki `README.md`'yi gösterir; bu
yüzden dosyaların o repoya taşınması gerekiyor.

## 1. Dosyaları profil reposuna kopyala

Şunları `kazimanilaydin/kazimanilaydin` reposunun köküne kopyala (eski README'nin yerine):

```
README.md
assets/            (header, hakkımda, stack, footer, butonlar, fontlar)
data/land-dots.json
scripts/
.github/workflows/profile.yml
package.json
.gitignore
```

`KURULUM.md` dosyasını kopyalaman gerekmez.

## 2. Canlı kartları üret

Globe dashboard'u ve contribution snake bir GitHub Action ile üretilir ve
`output` branch'ine yazılır. README bu branch'teki dosyaları gösterir.

1. Dosyaları `main` (ya da `master`) branch'ine push et. Workflow otomatikle çalışır.
   İstersen **Actions → Profile cards → Run workflow** ile elle de başlatabilirsin.
2. Workflow `output` branch'ini oluşturamazsa: **Settings → Actions → General →
   Workflow permissions** altında **Read and write permissions** seçeneğini aç.
3. Workflow her 6 saatte bir çalışıp istatistikleri tazeler.

İlk çalıştırma bitene kadar README'deki dashboard ve snake görselleri boş
görünür; bu normaldir.

## Özelleştirme

| Ne                          | Nerede                                                                 |
| --------------------------- | ---------------------------------------------------------------------- |
| Header, hakkımda, stack metni | `scripts/build-assets.mjs` dosyasının başındaki sabitler, ardından `npm install && npm run build:assets` |
| Repo kartları (isteğe bağlı) | `.github/workflows/profile.yml` içinde `FEATURED_REPOS` → `output/repo-<isim>.svg` |
| Gizlenecek diller           | `HIDE_LANGUAGES` (varsayılan: `Jupyter Notebook`)                      |
| Globe'daki şehirler / yaylar | `scripts/lib/globe.mjs` içindeki `HOME` ve `DESTINATIONS`              |
| Renk paleti                 | `scripts/lib/theme.mjs` içindeki `C`                                    |

Token olmadan tasarımı denemek için: `npm run preview` (örnek verilerle `preview/` klasörüne yazar).

## Nasıl çalışıyor?

GitHub README'leri JavaScript çalıştırmaz. Bu yüzden her şey animasyonlu SVG olarak üretilir:

- **Dönen globe:** Her kara noktası, dönerken ekranda bir elips çizer. Tüm noktalar tek bir
  CSS keyframe'ini paylaşır; boylam yalnızca animasyon gecikmesini belirler. Ön/arka yüz
  görünürlüğü enleme göre gruplanır.
- **Yaylar:** Her yayın şekli dönüşün 45 adımı için önceden hesaplanır ve SMIL ile morph
  edilir. Globe'un arkasına geçen kısım ufuk çizgisine sabitlenir.
- **Fontlar** (JetBrains Mono, Orbitron; SIL OFL) SVG'lerin içine gömülüdür. Böylece her
  tarayıcıda aynı görünür.
