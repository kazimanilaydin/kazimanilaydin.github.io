# Kurulum

## github.io sitesi

Site bu repoda (`kazimanilaydin.github.io`). Yayına almak için:

1. Bu branch'i `master`'a birleştir. Eski Vue sitesi git geçmişinde kalır.
2. GitHub'da **Settings → Pages → Build and deployment → Source: GitHub Actions** seçeneğini seç.
3. **Deploy site** workflow'u `master`'a her push'ta siteyi yayınlar ve her 6 saatte bir canlı
   istatistikleri (`data/stats.json`) yeniler. Elle başlatmak için **Actions → Deploy site → Run workflow**.

`github-profile/` klasörü GitHub profil README kitidir. `tools/build-stats.mjs` de onu kullandığı
için bu repoda kalmalıdır.

### Yerelde deneme

```bash
npm run serve        # http://localhost:8080
```

`data/stats.json` yoksa site GitHub'ın herkese açık API'sini kullanır (saatte 60 istek, tarayıcıda
1 saat önbelleklenir). Commit, PR ve issue sayıları ile katkı takvimi en doğru haliyle workflow'dan gelir.

## Özelleştirme

| Ne | Nerede |
| --- | --- |
| Metinler (daktilo satırları, roller, neofetch) | `index.html` ve `js/app.js` başındaki sabitler |
| Linkler | `js/app.js` → `LINKS` |
| Teknoloji yığını | `js/app.js` → `STACK` (yeni ikon için `tools/build-icons.mjs` → `npm run build:icons`) |
| Globe şehirleri ve yaylar | `js/globe.js` → `HOME`, `CITIES`, `CROSS` |
| Renkler | `css/style.css` → `:root` |
| Dünya dokusu | `tools/make-earth-texture.py` |

## Kaynaklar ve lisanslar

- [globe.gl](https://github.com/vasturiano/globe.gl) (three.js tabanlı), MIT: `vendor/LICENSE-globe.gl.txt`
- Dünya dokuları: NASA Blue Marble ve Black Marble (kamu malı), three-globe paketi aracılığıyla
- JetBrains Mono ve Orbitron fontları, SIL OFL 1.1: `fonts/LICENSE-*.txt`
- Marka ikonları: [simple-icons](https://simpleicons.org) (CC0). Windows ve LinkedIn ikonları
  jenerik olarak elle çizildi.
