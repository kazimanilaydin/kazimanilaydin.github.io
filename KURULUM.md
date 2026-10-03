# Kurulum

## github.io sitesi

Site statiktir ve bu repoda durur; GitHub Pages dosyaları doğrudan `master` branch'inden yayınlar.

1. GitHub'da **Settings → Pages → Build and deployment → Source: Deploy from a branch** seç.
2. Branch olarak `master`, klasör olarak `/ (root)` seç ve **Save** de.
3. Birkaç dakika içinde site https://kazimanilaydin.github.io adresinde açılır. Sonraki her push
   otomatik yayınlanır.

### Yerelde deneme

```bash
npm run serve        # http://localhost:8080
```

## Özelleştirme

| Ne | Nerede |
| --- | --- |
| Metinler (daktilo satırları, roller, neofetch, paneller) | `index.html` ve `js/app.js` başındaki sabitler |
| Linkler | `js/app.js` → `LINKS` |
| Teknoloji yığını | `js/app.js` → `STACK` (yeni ikon için `tools/build-icons.mjs` → `npm run build:icons`) |
| Globe şehirleri, yaylar ve rota listesi | `js/globe.js` → `HOME`, `CITIES`, `CROSS` |
| Renkler | `css/style.css` → `:root` |
| Dünya dokusu | `tools/make-earth-texture.py` |

## Kaynaklar ve lisanslar

- [globe.gl](https://github.com/vasturiano/globe.gl) (three.js tabanlı), MIT: `vendor/LICENSE-globe.gl.txt`
- Dünya dokuları: NASA Blue Marble ve Black Marble (kamu malı), three-globe paketi aracılığıyla
- JetBrains Mono ve Orbitron fontları, SIL OFL 1.1: `fonts/LICENSE-*.txt`
- Marka ikonları: [simple-icons](https://simpleicons.org) (CC0). Windows ve LinkedIn ikonları
  jenerik olarak elle çizildi.
