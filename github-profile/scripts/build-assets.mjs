// Static, animated SVGs committed under assets/: header, about (neofetch),
// tech stack and footer. Run after editing the copy below: npm run build:assets
import { writeFileSync } from 'node:fs';
import * as icons from 'simple-icons';
import { C, MONO, DISPLAY, esc, fmt, rng, svg, cardBase, brackets, stars, starsCss, fontFaces, panelDefs } from './lib/theme.mjs';

const out = (name, content) => {
  writeFileSync(new URL(`../assets/${name}`, import.meta.url), content);
  console.log(`assets/${name}  ${(content.length / 1024).toFixed(1)} KB`);
};

// ---------------------------------------------------------------------------
// Copy (taken from the GitHub bio and kazimanilaydin.github.io)
// ---------------------------------------------------------------------------
const NAME = 'KΛZIM ΛNIL ΛYDIN';
const MOTTO = '[ THINK & DO ]';
const ROLES = 'ENGINEER · DEVELOPER · THINKER';
const TYPED = [
  "Hello, World! I'm Kazım Anıl.",
  'Industrial engineer & developer.',
  'Follow the white rabbit.',
  'levántarse y brillar.',
];
const RABBIT_LINE = 2;

const ABOUT = [
  ['Name', 'Kazım Anıl Aydın'],
  ['Roles', 'Engineer · Developer · Thinker'],
  ['Field', 'Industrial Engineering'],
  ['Edu', 'Ordu Uni. · 19 Mayıs Uni. · Amasya Uni. · Vilnius Uni.'],
  ['Stack', 'Vue · Nuxt · React · Node.js · Python · Go'],
  ['Interests', 'AI · Data Mining · Robotics · Cryptography · Electronics'],
  ['OS', 'macOS · Windows · Linux'],
  ['Music', 'Rap · Hip-Hop · Pop'],
  ['Movies', 'Sci-Fi · Adventure · Action · Comedy'],
  ['Loves', 'Travel (nature & seaside) · Animals · Books'],
  ['Motto', 'Think & Do · levántarse y brillar'],
  ['Status', 'Follow the white rabbit'],
];

const LINKS = [
  { file: 'btn-linkedin.svg', label: 'LINKEDIN', sub: '/in/kazimanilaydin', icon: 'in' },
  { file: 'btn-medium.svg', label: 'MEDIUM', sub: '@kazimanilaydin', icon: 'medium' },
];

const STACK = [
  ['FRONTEND', [['JavaScript', 'javascript'], ['TypeScript', 'typescript'], ['Vue', 'vuedotjs'], ['Nuxt', 'nuxt'], ['React', 'react']]],
  ['BACKEND', [['Node.js', 'nodedotjs'], ['Express', 'express'], ['Python', 'python'], ['Flask', 'flask'], ['Go', 'go']]],
  ['DATA', [['MySQL', 'mysql'], ['PostgreSQL', 'postgresql'], ['MongoDB', 'mongodb'], ['R', 'r'], ['Jupyter', 'jupyter']]],
  ['SYSTEMS', [['macOS', 'macos'], ['Windows', { path: 'M2 2h9.5v9.5H2zm10.5 0H22v9.5h-9.5zM2 12.5h9.5V22H2zm10.5 0H22V22h-9.5z' }], ['Linux', 'linux'], ['Git', 'git'], ['Bash', 'gnubash']]],
];
// Items are [label, simple-icons slug] or [label, { path }] for a hand-drawn 24×24 glyph.

// Orbitron 900 advance widths (units per em = 1000); Λ is a flipped V squeezed to A's width.
const ORB = { K: 797, A: 836, Z: 821, I: 214, M: 928, N: 832, L: 779, Y: 806, D: 834, V: 1003, ' ': 322 };
const CAP = 0.72;

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

// White rabbit, sitting, facing right, in a 100×120 box.
const RABBIT = [
  { x: 42, y: 84, rx: 31, ry: 27 }, // body
  { x: 33, y: 90, rx: 23, ry: 21 }, // haunch
  { x: 62, y: 70, rx: 15, ry: 19 }, // chest
  { x: 69, y: 47, rx: 18, ry: 15 }, // head
  { x: 56, y: 20, rx: 8, ry: 21, rot: -16 }, // ears
  { x: 71, y: 18, rx: 8, ry: 21, rot: 4 },
  { x: 11, y: 80, rx: 9, ry: 9 }, // tail
  { x: 70, y: 106, rx: 11, ry: 6 }, // front paws
  { x: 38, y: 108, rx: 24, ry: 6 }, // hind foot
];
const EARS = [
  { x: 56, y: 22, rx: 3.2, ry: 14, rot: -16 },
  { x: 71, y: 20, rx: 3.2, ry: 14, rot: 4 },
];
const EYE = { x: 76, y: 44, rx: 3.6, ry: 3.6 };
const NOSE = { x: 87, y: 51, rx: 2.6, ry: 2.6 };
const HAUNCH = { x: 33, y: 92, rx: 19, ry: 16 };

const inEllipse = (px, py, e) => {
  const a = ((e.rot ?? 0) * Math.PI) / 180;
  const dx = px - e.x;
  const dy = py - e.y;
  const u = dx * Math.cos(a) + dy * Math.sin(a);
  const v = -dx * Math.sin(a) + dy * Math.cos(a);
  return (u * u) / (e.rx * e.rx) + (v * v) / (e.ry * e.ry) <= 1;
};

function rabbitVector(fill = '#fff') {
  const el = (e, f) => `<ellipse cx="${e.x}" cy="${e.y}" rx="${e.rx}" ry="${e.ry}"${e.rot ? ` transform="rotate(${e.rot} ${e.x} ${e.y})"` : ''} fill="${f}"/>`;
  return RABBIT.map((e) => el(e, fill)).join('') + EARS.map((e) => el(e, C.gold)).join('') + el(EYE, C.bg0) + el(NOSE, '#ff9eb8');
}

function codeRain(w, h, { cols, size, seed, words = [], opacity = 0.45 }) {
  const r = rng(seed);
  const CHARS = '01アイウエオカキクケコｱｲｳ<>{}[]=+*/#$%&ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  const safe = CHARS.replace(/[^\x20-\x7e]/g, '');
  const step = w / cols;
  const lh = size * 1.15;
  let s = '';
  for (let i = 0; i < cols; i++) {
    const len = 6 + Math.floor(r() * 14);
    const dur = fmt(5 + r() * 9, 2);
    const del = -fmt(r() * dur, 2);
    let chars = [...Array(len)].map(() => safe[Math.floor(r() * safe.length)]);
    if (words.length && r() < 0.28) {
      const word = words[Math.floor(r() * words.length)];
      const at = Math.max(0, len - word.length - 1);
      chars.splice(at, word.length, ...word);
      chars = chars.slice(0, len);
    }
    let col = '';
    chars.forEach((ch, j) => {
      const head = j === chars.length - 1;
      const o = fmt(head ? 1 : 0.15 + 0.85 * ((j + 1) / chars.length) ** 1.6, 2);
      col += `<text y="${fmt(-(chars.length - j) * lh, 1)}"${head ? ' class="hd"' : ''} opacity="${o}">${esc(ch)}</text>`;
    });
    s += `<g class="rain" transform="translate(${fmt(i * step + step / 2, 1)} 0)"><g style="animation-duration:${dur}s;animation-delay:${del}s" class="fall">${col}</g></g>`;
  }
  const css =
    `.rain text{font:400 ${size}px ${MONO};fill:${C.cyan};text-anchor:middle}.rain .hd{fill:#e6fbff}` +
    `.fall{animation:fall 9s linear infinite}@keyframes fall{from{transform:translateY(0)}to{transform:translateY(${fmt(h + 22 * lh, 0)}px)}}`;
  return { svg: `<g opacity="${opacity}">${s}</g>`, css };
}

function floorGrid(w, h, top, vy) {
  let d = '';
  for (let x = -900; x <= w + 900; x += 80) d += `M${w / 2} ${vy}L${x} ${h}`;
  for (let k = 0; k < 6; k++) d += `M0 ${fmt(top + (h - top) * (k / 5) ** 1.7, 1)}H${w}`;
  return `<path d="${d}" stroke="${C.cyan}" stroke-opacity=".2" fill="none" mask="url(#floorMask)"/>`;
}
const floorDefs = (w, h, top) =>
  `<linearGradient id="floorFade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>` +
  `<mask id="floorMask"><rect y="${top}" width="${w}" height="${h - top}" fill="url(#floorFade)"/></mask>`;

function windowChrome(w, title) {
  return (
    `<path d="M0 18a18 18 0 0 1 18-18h${w - 36}a18 18 0 0 1 18 18v20H0Z" fill="${C.cyan}" fill-opacity=".06"/>` +
    `<path d="M0 38H${w}" stroke="${C.cyan}" stroke-opacity=".18"/>` +
    `<circle cx="22" cy="19" r="5.5" fill="#ff5f6d"/><circle cx="40" cy="19" r="5.5" fill="${C.gold}"/><circle cx="58" cy="19" r="5.5" fill="${C.ok}"/>` +
    `<text class="wt" x="${w / 2}" y="23" text-anchor="middle">${esc(title)}</text>`
  );
}

// SMIL typing: a clip rect grows char by char, holds, then erases.
function typer({ lines, x, y, charW, height, typeSpeed = 0.075, hold = 1.9, eraseSpeed = 0.028, gap = 0.35, begin = 0 }) {
  const slots = lines.map((l) => l.length * typeSpeed + hold + l.length * eraseSpeed + gap);
  const total = slots.reduce((a, b) => a + b, 0);
  let t0 = 0;
  let s = '';
  const windows = [];
  lines.forEach((line, i) => {
    const n = [...line].length;
    const times = [0];
    const vals = [0];
    const push = (t, v) => {
      times.push(t / total);
      vals.push(v);
    };
    for (let k = 1; k <= n; k++) push(t0 + k * typeSpeed, k * charW);
    const typed = t0 + n * typeSpeed;
    push(typed + hold, n * charW);
    for (let k = n - 1; k >= 0; k--) push(typed + hold + (n - k) * eraseSpeed, k * charW);
    const kt = times.map((t) => fmt(t, 5));
    const v = vals.map((w) => fmt(w, 1));
    // Width must be 0 before the slot starts.
    if (kt[1] > 0) {
      kt.splice(1, 0, fmt(Math.max(0, (t0 - 0.0001) / total), 5));
      v.splice(1, 0, 0);
    }
    const id = `ty${i}`;
    s += `<clipPath id="${id}"><rect x="${x}" y="${y - height}" width="0" height="${height + 8}">` +
      `<animate attributeName="width" begin="${begin}s" dur="${fmt(total, 3)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt.join(';')}" values="${v.join(';')}"/></rect></clipPath>` +
      `<text class="typed" x="${x}" y="${y}" clip-path="url(#${id})">${esc(line)}</text>` +
      `<rect class="caret" x="${x}" y="${y - height + 4}" width="${fmt(charW * 0.9, 1)}" height="${height}" opacity="0" fill="${C.cyan}">` +
      `<animate attributeName="x" begin="${begin}s" dur="${fmt(total, 3)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt.join(';')}" values="${v.map((w) => fmt(x + w + 2, 1)).join(';')}"/>` +
      `<animate attributeName="opacity" begin="${begin}s" dur="${fmt(total, 3)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${fmt(t0 / total, 5)};${fmt((t0 + slots[i] - gap) / total, 5)}" values="0;1;0"/></rect>`;
    windows.push([t0, t0 + slots[i]]);
    t0 += slots[i];
  });
  return { svg: s, total, windows };
}

const rmCss = (extra = '') => `@media (prefers-reduced-motion:reduce){${extra}*{animation-play-state:paused!important}}`;

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function header() {
  const W = 1000;
  const H = 320;
  const base = cardBase(W, H, 'hd');
  const rain = codeRain(W, H, { cols: 46, size: 13, seed: 5, words: ['THINK', 'DO', 'VUE', 'NODE', 'PYTHON', 'REACT', 'GO', 'ANIL', 'LINUX'], opacity: 0.32 });

  // Name, letter by letter.
  const fs = 54;
  const ls = 7;
  const letters = [...NAME].map((ch) => ({ ch, adv: (ch === 'Λ' ? ORB.A : ORB[ch]) * (fs / 1000) }));
  const total = letters.reduce((n, l) => n + l.adv, 0) + ls * (letters.length - 1);
  let x = (W - total) / 2;
  const by = 146;
  const r = rng(3);
  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&@';
  let name = '';
  let scramble = '';
  letters.forEach((l, i) => {
    const t = fmt(0.25 + i * 0.07, 2);
    if (l.ch !== ' ') {
      const glyph = l.ch === 'Λ'
        ? `<g transform="translate(${fmt(x, 1)} ${fmt(2 * (by - (CAP * fs) / 2), 1)}) scale(${fmt(ORB.A / ORB.V, 4)} -1)"><text x="0" y="${by}">V</text></g>`
        : `<text x="${fmt(x, 1)}" y="${by}">${l.ch}</text>`;
      name += `<g class="ch" style="animation-delay:${t}s">${glyph}</g>`;
      for (let k = 0; k < 2; k++) {
        scramble += `<text class="sc" style="animation-delay:${fmt(t - 0.2 + k * 0.1, 2)}s" x="${fmt(x, 1)}" y="${by}">${GLYPHS[Math.floor(r() * GLYPHS.length)]}</text>`;
      }
    }
    x += l.adv + ls;
  });

  const ty = typer({ lines: TYPED, x: 322, y: 262, charW: 10.8, height: 20, begin: 1.6 });
  const [r0, r1] = ty.windows[RABBIT_LINE];
  const hop = [...Array(18)].map(() => 'q34 -36 68 0').join(' ');
  const rabbit =
    `<g opacity="0"><animate attributeName="opacity" begin="1.6s" dur="${fmt(ty.total, 3)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${fmt(r0 / ty.total, 4)};${fmt(r1 / ty.total, 4)}" values="0;1;0"/>` +
    `<g><animateMotion begin="1.6s" dur="${fmt(ty.total, 3)}s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;${fmt(r0 / ty.total, 4)};${fmt(r1 / ty.total, 4)};1" path="M-60 300 ${hop}"/>` +
    `<g transform="translate(-24 -50) scale(.42)" filter="url(#glow)">${rabbitVector()}</g></g></g>`;

  const css =
    fontFaces({ mono: [400, 700], display: [500, 900] }) + starsCss + rain.css +
    `text{font-family:${MONO}}` +
    `.nm text{font:900 ${fs}px ${DISPLAY};fill:url(#nameFill)}` +
    `.ch{animation:dec .7s steps(1) both}@keyframes dec{0%{opacity:0}30%{opacity:1}45%{opacity:.25}60%,100%{opacity:1}}` +
    `.sc{font:900 ${fs}px ${DISPLAY};fill:${C.cyan};opacity:0;animation:blip .1s steps(1) forwards}@keyframes blip{0%,99%{opacity:.9}100%{opacity:0}}` +
    `.gl text{fill:#ff5d6c}.gl2 text{fill:${C.cyan}}.gl{opacity:0;animation:glitch 7s steps(1) 2.6s infinite}.gl2{animation-delay:2.65s}` +
    `@keyframes glitch{0%{opacity:.7;transform:translate(-4px,1px)}2%{opacity:.6;transform:translate(3px,-1px)}4%,100%{opacity:0;transform:none}}` +
    `.motto{font:500 15px ${DISPLAY};letter-spacing:6px;fill:${C.gold}}` +
    `.roles{font-size:12.5px;letter-spacing:3.5px;fill:#9fc3e6}` +
    `.fade{animation:fade 1s ease-out both}@keyframes fade{from{opacity:0;transform:translateY(6px)}}` +
    `.typed{font:400 18px ${MONO};fill:${C.cyan}}.prompt{font:700 18px ${MONO};fill:${C.gold}}` +
    `.hud{font-size:10.5px;letter-spacing:2px;fill:${C.mute}}` +
    `.blink{animation:blink 1.2s steps(1) infinite}@keyframes blink{50%{opacity:0}}` +
    rmCss('.ch,.fade,.sc{animation:none}.sc,.gl{display:none}');

  const defs =
    base.defs + panelDefs + floorDefs(W, H, 268) +
    `<linearGradient id="nameFill" x1="0" x2="0" y1="0" y2="1"><stop offset=".15" stop-color="#fff"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>` +
    `<radialGradient id="vig" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="${C.bg0}" stop-opacity=".92"/><stop offset=".55" stop-color="${C.bg0}" stop-opacity=".55"/><stop offset="1" stop-color="${C.bg0}" stop-opacity="0"/></radialGradient>`;

  const body =
    `<g clip-path="${base.clip}">${base.back}` +
    stars(W, H, 60, 9) + rain.svg +
    `<ellipse cx="500" cy="175" rx="470" ry="150" fill="url(#vig)"/>` +
    floorGrid(W, H, 268, 200) +
    `<text class="hud" x="24" y="30">SYS://KAZIMANILAYDIN</text><circle class="blink" cx="214" cy="26.5" r="3" fill="${C.ok}"/>` +
    `<text class="hud" x="${W - 24}" y="30" text-anchor="end">TR · UTC+03:00 · EST. 2016</text>` +
    brackets(14, 14, W - 28, H - 28, 16, C.cyan, 0.5) +
    `<g filter="url(#glowBig)" class="nm">${name}</g>` +
    `<g class="nm gl">${name.replace(/class="ch"/g, 'class="x"')}</g>` +
    `<g class="nm gl gl2">${name.replace(/class="ch"/g, 'class="x"')}</g>` +
    `<g class="nm">${scramble}</g>` +
    `<text class="motto fade" style="animation-delay:1.3s" x="500" y="188" text-anchor="middle">${esc(MOTTO)}</text>` +
    `<text class="roles fade" style="animation-delay:1.5s" x="500" y="216" text-anchor="middle">${esc(ROLES)}</text>` +
    `<text class="prompt" x="300" y="262">❯</text>` + ty.svg + rabbit +
    `</g>${base.edge}`;

  return svg({
    w: W,
    h: H,
    title: 'Kazım Anıl Aydın — Think & Do',
    desc: `${ROLES}. ${TYPED.join(' ')}`,
    defs,
    css,
    body,
  });
}

// ---------------------------------------------------------------------------
// About: neofetch in a terminal window
// ---------------------------------------------------------------------------
function about() {
  const W = 1000;
  const H = 420;
  const base = cardBase(W, H, 'ab');

  // Pixel-art rabbit sampled from the vector shape.
  const cell = 4;
  const px = 7;
  const ox = 46;
  const oy = 100;
  let pixels = '';
  for (let row = 0; row < 29; row++) {
    for (let col = 0; col < 25; col++) {
      const sx = col * cell + cell / 2;
      const sy = row * cell + cell / 2;
      if (!RABBIT.some((e) => inEllipse(sx, sy, e))) continue;
      const fill = inEllipse(sx, sy, EYE) ? C.bg0
        : inEllipse(sx, sy, NOSE) ? '#ff9eb8'
        : EARS.some((e) => inEllipse(sx, sy, e)) ? C.gold
        : inEllipse(sx, sy, HAUNCH) ? '#e4f6ff' : '#fff';
      pixels += `<rect class="px" style="animation-delay:${fmt(0.9 + row * 0.04, 3)}s" x="${ox + col * (px + 1)}" y="${oy + row * (px + 1)}" width="${px}" height="${px}" rx="1.2" fill="${fill}"/>`;
    }
  }

  const ix = 300;
  const keyW = 96;
  const host = 'anil@think-and-do';
  const rows = ABOUT.map(([k, v], i) => {
    const y = 136 + i * 20;
    const delay = fmt(1 + i * 0.09, 2);
    return `<g class="ln" style="animation-delay:${delay}s"><text class="k" x="${ix}" y="${y}">${esc(k)}</text><text class="v" x="${ix + keyW}" y="${y}">${esc(v)}${k === 'Status' ? ' <tspan class="rab">🐇</tspan>' : ''}</text></g>`;
  }).join('');
  const palette = [C.bg1, '#0b3a6e', C.blue, C.cyanDim, C.cyan, C.ok, C.gold, '#ff5d6c']
    .map((c, i) => `<rect class="ln" style="animation-delay:${fmt(2.2 + i * 0.05, 2)}s" x="${ix + i * 30}" y="${136 + ABOUT.length * 20 - 2}" width="26" height="14" rx="2" fill="${c}"/>`).join('');

  // Type "neofetch" once and keep it.
  const cmd = 'neofetch';
  const cw = 8.4;
  const typed = {
    svg: `<clipPath id="cmd"><rect x="201" y="56" width="0" height="22"><animate attributeName="width" begin=".3s" dur="${fmt(cmd.length * 0.07, 2)}s" fill="freeze" calcMode="discrete" ` +
      `keyTimes="${[...cmd].map((_, k) => fmt(k / cmd.length, 4)).join(';')}" values="${[...cmd].map((_, k) => fmt((k + 1) * cw, 1)).join(';')}"/></rect></clipPath>` +
      `<text class="typed" x="201" y="72" clip-path="url(#cmd)">${cmd}</text>`,
  };

  const css =
    fontFaces({ mono: [400, 700] }) +
    `text{font-family:${MONO};font-size:14px}` +
    `.wt{font-size:12px;fill:${C.mute}}` +
    `.host{font-weight:700;fill:${C.cyan}}.path{fill:#fff}.typed{fill:#fff;font-size:14px}` +
    `.k{font-weight:700;fill:${C.gold}}.v{fill:#d7e9fb}.hr{fill:${C.mute}}` +
    `.ln,.px{animation:in .35s ease-out both}@keyframes in{from{opacity:0}}` +
    `.scan{animation:scan 4s ease-in-out 3s infinite}@keyframes scan{0%{transform:translateY(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(240px);opacity:0}}` +
    `.cur{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}` +
    rmCss('.ln,.px{animation:none}.scan{display:none}');

  const body =
    `<g clip-path="${base.clip}">${base.back}` + windowChrome(W, `${host}: ~ — zsh`) +
    `<text x="24" y="72"><tspan class="host">${host}</tspan><tspan class="path">:~$</tspan></text>` + typed.svg +
    `<g>${pixels}</g>` +
    `<rect class="scan" x="40" y="${oy - 4}" width="212" height="3" fill="${C.cyan}" opacity="0" filter="url(#glow)"/>` +
    `<g class="ln" style="animation-delay:.9s"><text class="host" x="${ix}" y="104">${host}</text><text class="hr" x="${ix}" y="118">${'─'.repeat(host.length)}</text></g>` +
    rows + palette +
    `<text x="24" y="${H - 22}" class="ln" style="animation-delay:2.6s"><tspan class="host">${host}</tspan><tspan class="path">:~$ </tspan><tspan class="cur" fill="${C.cyan}">█</tspan></text>` +
    `</g>${base.edge}`;

  return svg({
    w: W,
    h: H,
    title: 'neofetch — Kazım Anıl Aydın',
    desc: ABOUT.map(([k, v]) => `${k}: ${v}`).join('. '),
    defs: base.defs + panelDefs,
    css,
    body,
  });
}

// ---------------------------------------------------------------------------
// Tech stack
// ---------------------------------------------------------------------------
function stack() {
  const W = 1000;
  const H = 336;
  const base = cardBase(W, H, 'st');
  const bySlug = Object.fromEntries(Object.values(icons).filter((i) => i && i.slug).map((i) => [i.slug, i]));
  const tile = 84;
  const gap = 12;
  let body = '';
  let n = 0;
  const totalTiles = STACK.reduce((s, [, items]) => s + items.length, 0);
  const cycle = totalTiles * 0.45;
  STACK.forEach(([title, items], q) => {
    const qx = 32 + (q % 2) * 484;
    const qy = 66 + Math.floor(q / 2) * 142;
    body += `<text class="qt" x="${qx}" y="${qy}">${String(q + 1).padStart(2, '0')} // ${title}</text>` +
      `<path d="M${qx + 150} ${qy - 4}H${qx + 468}" stroke="${C.cyan}" stroke-opacity=".18"/>`;
    items.forEach(([label, slug], i) => {
      const icon = typeof slug === 'string' ? bySlug[slug] : slug;
      if (!icon) throw new Error(`simple-icons has no "${slug}"`);
      const x = qx + i * (tile + gap);
      const y = qy + 14;
      const d = fmt(n * 0.45, 2);
      body +=
        `<g class="tile" style="animation-delay:${fmt(0.2 + n * 0.05, 2)}s">` +
        `<rect x="${x}" y="${y}" width="${tile}" height="${tile}" rx="12" fill="${C.panel}" fill-opacity=".8" stroke="${C.cyan}" stroke-opacity=".22"/>` +
        `<rect class="hl" style="animation-delay:${d}s" x="${x}" y="${y}" width="${tile}" height="${tile}" rx="12" fill="none" stroke="${C.gold}" stroke-width="1.5"/>` +
        `<g transform="translate(${x + tile / 2 - 15} ${y + 16}) scale(1.25)"><path d="${icon.path}" fill="${C.cyan}"/></g>` +
        `<g class="hl" style="animation-delay:${d}s" transform="translate(${x + tile / 2 - 15} ${y + 16}) scale(1.25)"><path d="${icon.path}" fill="${C.goldHi}"/></g>` +
        `<text class="lb" x="${x + tile / 2}" y="${y + 70}" text-anchor="middle">${esc(label)}</text></g>`;
      n++;
    });
  });

  const css =
    fontFaces({ mono: [400], display: [500] }) +
    `text{font-family:${MONO}}.wt{font-size:12px;fill:${C.mute}}` +
    `.qt{font:500 12px ${DISPLAY};letter-spacing:2.5px;fill:${C.gold}}.lb{font-size:11px;fill:#cfe3f7}` +
    `.tile{animation:in .5s ease-out both}@keyframes in{from{opacity:0;transform:translateY(8px)}}` +
    `.hl{opacity:0;animation:hl ${fmt(cycle, 2)}s ease-in-out infinite}@keyframes hl{0%,${fmt((100 * 1.4) / cycle, 2)}%{opacity:0}${fmt((100 * 0.3) / cycle, 2)}%,${fmt((100 * 0.7) / cycle, 2)}%{opacity:1}}` +
    rmCss('.tile{animation:none}.hl{display:none}');

  return svg({
    w: W,
    h: H,
    title: 'Tech stack',
    desc: STACK.map(([t, items]) => `${t}: ${items.map(([l]) => l).join(', ')}`).join('. '),
    defs: base.defs,
    css,
    body: `<g clip-path="${base.clip}">${base.back}${windowChrome(W, '~/stack — ls -la')}${body}</g>${base.edge}`,
  });
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function footer() {
  const W = 1000;
  const H = 150;
  const base = cardBase(W, H, 'ft');
  const rain = codeRain(W, H, { cols: 46, size: 11, seed: 21, opacity: 0.18 });
  const css =
    fontFaces({ mono: [400], display: [900] }) + starsCss + rain.css +
    `text{font-family:${MONO}}` +
    `.big{font:900 30px ${DISPLAY};letter-spacing:10px;fill:url(#ftFill)}` +
    `.sub{font-size:12.5px;letter-spacing:3px;fill:${C.mute}}` +
    `.twitch{animation:twitch 5s ease-in-out infinite;transform-origin:50px 110px}@keyframes twitch{0%,86%,100%{transform:none}90%{transform:translateY(-14px)}94%{transform:none}}` +
    rmCss();
  const body =
    `<g clip-path="${base.clip}">${base.back}` + stars(W, H, 40, 4) + rain.svg +
    `<ellipse cx="500" cy="75" rx="420" ry="70" fill="url(#vigF)"/>` +
    floorGrid(W, H, 100, 60) +
    `<g filter="url(#glowBig)"><text class="big" x="500" y="78" text-anchor="middle">THINK &amp; DO</text></g>` +
    `<text class="sub" x="500" y="108" text-anchor="middle">levántarse y brillar  ·  thanks for stopping by</text>` +
    `<path d="M150 70H300M700 70H850" stroke="url(#ftLine)"/>` +
    `<g transform="translate(92 44) scale(.48)" filter="url(#glow)"><g class="twitch">${rabbitVector()}</g></g>` +
    `</g>${base.edge}`;
  return svg({
    w: W,
    h: H,
    title: 'Think & Do',
    desc: 'levántarse y brillar — thanks for stopping by',
    defs: base.defs + panelDefs + floorDefs(W, H, 100) +
      `<linearGradient id="ftFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>` +
      `<linearGradient id="ftLine"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>` +
      `<radialGradient id="vigF"><stop offset="0" stop-color="${C.bg0}" stop-opacity=".9"/><stop offset="1" stop-color="${C.bg0}" stop-opacity="0"/></radialGradient>`,
    css,
    body,
  });
}

// ---------------------------------------------------------------------------
// Link buttons
// ---------------------------------------------------------------------------
function button({ label, sub, icon }, i) {
  const W = 220;
  const H = 52;
  const si = Object.values(icons).find((x) => x && x.slug === icon);
  const glyph = si
    ? `<g transform="translate(16 14) scale(1)"><path d="${si.path}" fill="${C.cyan}"/></g>`
    : `<rect x="16.5" y="14.5" width="23" height="23" rx="5" fill="none" stroke="${C.cyan}" stroke-width="1.6"/><text class="in" x="28" y="31" text-anchor="middle">${esc(icon)}</text>`;
  const css =
    fontFaces({ mono: [], display: [500] }) +
    `text{font-family:${DISPLAY};font-weight:500}.lb{font-size:12.5px;letter-spacing:2.5px;fill:#fff}.sb{font-size:9.5px;letter-spacing:.5px;fill:${C.mute}}.in{font-size:12px;fill:${C.cyan}}` +
    `.sh{animation:sh 4.5s ease-in-out ${fmt(i * 0.6, 1)}s infinite}@keyframes sh{0%{transform:translateX(-80px)}40%,100%{transform:translateX(${W + 40}px)}}` +
    `@media (prefers-reduced-motion:reduce){.sh{display:none}}`;
  const body =
    `<clipPath id="bc"><rect width="${W}" height="${H}" rx="12"/></clipPath>` +
    `<g clip-path="url(#bc)"><rect width="${W}" height="${H}" fill="url(#bb)"/>` +
    `<rect class="sh" width="60" height="${H}" fill="url(#bs)" transform="skewX(-20)"/></g>` +
    `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="11.5" fill="none" stroke="url(#be)" stroke-width="1.5"/>` +
    glyph +
    `<text class="lb" x="54" y="23">${esc(label)}</text><text class="sb" x="54" y="39">${esc(sub)}</text>` +
    `<path d="M${W - 30} 21l5 5-5 5M${W - 22} 21l5 5-5 5" fill="none" stroke="${C.cyan}" stroke-width="1.6" stroke-opacity=".8"/>`;
  return svg({
    w: W,
    h: H,
    title: `${label} — ${sub}`,
    desc: `Link to ${label}`,
    defs:
      `<linearGradient id="bb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.bg1}"/><stop offset="1" stop-color="${C.bg0}"/></linearGradient>` +
      `<linearGradient id="be" x1="0" x2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".7"/><stop offset="1" stop-color="${C.gold}" stop-opacity=".5"/></linearGradient>` +
      `<linearGradient id="bs"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".5" stop-color="${C.cyan}" stop-opacity=".22"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>`,
    css,
    body,
  });
}

out('header.svg', header());
out('about.svg', about());
out('stack.svg', stack());
out('footer.svg', footer());
LINKS.forEach((link, i) => out(link.file, button(link, i)));
