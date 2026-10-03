"""Builds img/earth-hud.jpg: NASA Blue Marble relief tinted navy/steel, with
NASA Black Marble city lights in gold (both public domain, shipped in the
three-globe npm package).

    npm pack three-globe && tar xzf three-globe-*.tgz
    pip install pillow numpy
    python3 tools/make-earth-texture.py package/example/img img/earth-hud.jpg
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1].rstrip('/') + '/', sys.argv[2]
W, H = 4096, 2048
load = lambda f: np.asarray(Image.open(src + f).convert('RGB').resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
bm = load('earth-blue-marble.jpg')
nt = load('earth-night.jpg')

r, g, b = bm[..., 0], bm[..., 1], bm[..., 2]
lum = (0.3 * r + 0.59 * g + 0.11 * b) ** 1.35
land = np.clip(((r + g) / 2 - b * 0.85) * 6 + 0.5, 0, 1)
ocean = np.stack([0.01 + 0.04 * lum, 0.05 + 0.10 * lum, 0.14 + 0.20 * lum], -1)
landc = np.stack([0.05 + 0.20 * lum, 0.12 + 0.33 * lum, 0.21 + 0.42 * lum], -1)
base = ocean * (1 - land[..., None]) + landc * land[..., None]

# City lights are the bright (red channel) pixels of the night map.
light = np.clip((nt[..., 0] - 0.14) / 0.30, 0, 1) ** 1.2
glow = np.asarray(Image.fromarray((light * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
gold = np.array([1.0, 0.72, 0.30])
img = np.clip(base + light[..., None] * gold * 1.15 + glow[..., None] * gold * 0.7, 0, 1)

Image.fromarray((img * 255).astype(np.uint8)).save(out, quality=86, optimize=True, progressive=True)
print(out)
