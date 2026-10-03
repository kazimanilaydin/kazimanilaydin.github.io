// Shared palette, fonts and SVG helpers for every generated card.
import { readFileSync } from 'node:fs';

export const C = {
  bg0: '#020611',
  bg1: '#061430',
  panel: '#081a36',
  line: '#1d3f6b',
  cyan: '#3be8ff',
  cyanDim: '#1b8fbf',
  blue: '#2f7bff',
  gold: '#ffb84d',
  goldHi: '#ffe2a8',
  text: '#e6f4ff',
  mute: '#7d97b6',
  ok: '#3df58a',
};

export const MONO = "JBM,'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
export const DISPLAY = "ORB,Orbitron,'Segoe UI',Roboto,sans-serif";

const fontsDir = new URL('../../assets/fonts/', import.meta.url);
const b64 = (file) => readFileSync(new URL(file, fontsDir)).toString('base64');
const face = (family, weight, file) =>
  `@font-face{font-family:${family};font-weight:${weight};src:url(data:font/woff2;base64,${b64(file)}) format('woff2')}`;

// Fonts are embedded so the cards render identically everywhere: SVGs shown
// through <img> on GitHub cannot load external resources.
export function fontFaces({ mono = [400, 700], display = [] } = {}) {
  const monoFiles = { 400: 'jetbrains-mono-regular.woff2', 700: 'jetbrains-mono-bold.woff2' };
  return [
    ...mono.map((w) => face('JBM', w, monoFiles[w])),
    ...display.map((w) => face('ORB', w, `orbitron-${w}.woff2`)),
  ].join('');
}

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const fmt = (n, d = 2) => +n.toFixed(d);

// Deterministic PRNG so regenerated assets only change when their inputs do.
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function svg({ w, h, title, desc, css = '', defs = '', body }) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">` +
    `<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>` +
    `<defs>${defs}</defs><style>${css}</style>${body}</svg>\n`
  );
}

// Dark rounded card with a subtle grid and glowing border, used as the base of every card.
export function cardBase(w, h, id = 'card') {
  const defs =
    `<linearGradient id="${id}Bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg0}"/></linearGradient>` +
    `<linearGradient id="${id}Edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".55"/><stop offset=".5" stop-color="${C.blue}" stop-opacity=".15"/><stop offset="1" stop-color="${C.gold}" stop-opacity=".45"/></linearGradient>` +
    `<pattern id="${id}Grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${C.cyan}" stroke-opacity=".05"/></pattern>` +
    `<clipPath id="${id}Clip"><rect width="${w}" height="${h}" rx="18"/></clipPath>`;
  const back = `<rect width="${w}" height="${h}" rx="18" fill="url(#${id}Bg)"/><rect width="${w}" height="${h}" rx="18" fill="url(#${id}Grid)"/>`;
  const edge = `<rect x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" rx="17.5" fill="none" stroke="url(#${id}Edge)" stroke-width="1.5"/>`;
  return { defs, back, edge, clip: `url(#${id}Clip)` };
}

// Small HUD-style corner brackets around a rectangle.
export function brackets(x, y, w, h, len = 10, color = C.cyan, opacity = 0.8) {
  const p = [
    `M${x} ${y + len}V${y}H${x + len}`,
    `M${x + w - len} ${y}H${x + w}V${y + len}`,
    `M${x + w} ${y + h - len}V${y + h}H${x + w - len}`,
    `M${x + len} ${y + h}H${x}V${y + h - len}`,
  ].join('');
  return `<path d="${p}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.5"/>`;
}

// Glass HUD panel like the ones floating around the globe.
export function panel(x, y, w, h) {
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${C.panel}" fill-opacity=".72" stroke="${C.cyan}" stroke-opacity=".28"/>` +
    `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${Math.min(26, h / 3)}" rx="9" fill="url(#panelSheen)"/>` +
    brackets(x - 3, y - 3, w + 6, h + 6, 9, C.cyan, 0.55)
  );
}

export const panelDefs =
  `<linearGradient id="panelSheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".14"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>` +
  `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
  `<filter id="glowBig" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

// Twinkling starfield.
export function stars(w, h, count, seed = 7) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = fmt(r() * w, 1);
    const y = fmt(r() * h, 1);
    const size = fmt(0.4 + r() * r() * 1.4, 2);
    const o = fmt(0.25 + r() * 0.6, 2);
    const tw = r() < 0.3 ? ` class="tw" style="animation-delay:-${fmt(r() * 4, 2)}s;animation-duration:${fmt(2 + r() * 4, 2)}s"` : '';
    out += `<circle cx="${x}" cy="${y}" r="${size}" fill="${r() < 0.15 ? C.goldHi : '#cfe9ff'}" opacity="${o}"${tw}/>`;
  }
  return out;
}

export const starsCss = '.tw{animation:tw 3s ease-in-out infinite alternate}@keyframes tw{to{opacity:.08}}';
