# kazimanilaydin — [ Think & Do ]

`kazimanilaydin.github.io` için yeni kişisel site ve GitHub profil README'si.

## Site (repo kökü)

Statik bir site; derleme adımı gerektirmez. Navy / cyan / altın HUD teması kullanır.

- **Profile:** Kod yağmuru, decode efektli "KΛZIM ΛNIL ΛYDIN", daktilo satırları,
  "Follow the white rabbit" satırında zıplayan beyaz tavşan, neofetch terminali ve teknoloji yığını.
- **Network:** Sürüklenebilir, otomatik dönen 3B WebGL dünya. Gece ışıkları, cyan atmosfer ve
  Türkiye'den dünyaya parlayan yaylar içerir. Etrafında canlı GitHub panelleri bulunur: katkılar,
  seri, aktif günler, diller ve durum.
- **Links:** GitHub, LinkedIn, Medium ve 16 dilde "merhaba".

| Dosya | İçerik |
| --- | --- |
| `index.html`, `css/style.css` | Sayfa ve tema |
| `js/app.js` | Sekmeler, animasyonlar, metinler |
| `js/globe.js` | WebGL globe (şehirler, yaylar) |
| `js/data.js` | Canlı veriler: `data/stats.json`, yoksa GitHub'ın herkese açık API'si |
| `.github/workflows/pages.yml` | 6 saatte bir `data/stats.json` üretir ve siteyi GitHub Pages'e yayınlar |
| `vendor/`, `img/`, `fonts/` | globe.gl, dünya dokusu, fontlar |
| `tools/` | İkon, istatistik ve doku üreticileri |

## GitHub profil README'si (`github-profile/`)

`kazimanilaydin/kazimanilaydin` reposu için animasyonlu SVG profil. JS içermeyen dönen globe
dashboard'unu da kapsar. Kurulumu için `github-profile/KURULUM.md` dosyasına bak.

Kurulum adımları: [KURULUM.md](KURULUM.md)
