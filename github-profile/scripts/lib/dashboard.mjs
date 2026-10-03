// "Global connectivity" HUD: the rotating globe surrounded by live GitHub metrics.
import { C, MONO, DISPLAY, esc, fmt, rng, svg, cardBase, panel, panelDefs, stars, starsCss, fontFaces } from './theme.mjs';
import { globe } from './globe.mjs';

const W = 1000;
const H = 660;
const nf = (n) => Math.round(n).toLocaleString('en-US');

// The greetings that cycled on kazimanilaydin.github.io.
export const GREETINGS = [
  'Hallo', 'Здравствуйте', 'Hello', 'Merhaba', 'नमस्ते', '¡Hola!', 'Ciao!', 'Olá!',
  'こんにちは！', '你好！', 'Привіт!', 'مرحبا!', 'Salam!', 'Salut!', 'Bună!', 'سلام!',
];

const chevrons = (x, y) =>
  [0, 7].map((dx, i) => `<path class="chev c${i}" d="M${x + dx} ${y}l4 4-4 4" fill="none" stroke="${C.cyan}" stroke-width="1.6"/>`).join('');

function sparkline(vals, x, y, w, h) {
  const max = Math.max(1, ...vals);
  const pts = vals.map((v, i) => [x + (w * i) / Math.max(1, vals.length - 1), y + h - (h * v) / max]);
  const line = 'M' + pts.map((p) => `${fmt(p[0], 1)} ${fmt(p[1], 1)}`).join('L');
  const last = pts[pts.length - 1];
  return (
    `<path d="${line}L${x + w} ${y + h}L${x} ${y + h}Z" fill="url(#sparkFill)"/>` +
    `<path class="draw" pathLength="1" d="${line}" fill="none" stroke="${C.cyan}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<circle class="blink" cx="${fmt(last[0], 1)}" cy="${fmt(last[1], 1)}" r="2.6" fill="#fff"/>`
  );
}

function bars(vals, x, y, w, h, color = C.cyan) {
  const max = Math.max(1, ...vals);
  const bw = w / vals.length;
  return vals
    .map((v, i) => {
      const bh = Math.max(1.5, (h * v) / max);
      return `<rect class="grow-y" style="animation-delay:${fmt(0.4 + i * 0.05, 2)}s" x="${fmt(x + i * bw + 1, 1)}" y="${fmt(y + h - bh, 1)}" width="${fmt(bw - 2, 1)}" height="${fmt(bh, 1)}" rx="1" fill="${color}" fill-opacity="${fmt(0.35 + (0.65 * v) / max, 2)}"/>`;
    })
    .join('');
}

// Background ornaments: hexagons, a constellation and a perspective floor.
function ornaments() {
  const r = rng(11);
  let hex = '';
  const hx = (cx, cy, s) => {
    const p = [...Array(6)].map((_, i) => `${fmt(cx + s * Math.cos((Math.PI / 3) * i), 1)} ${fmt(cy + s * Math.sin((Math.PI / 3) * i), 1)}`);
    return `M${p.join('L')}Z`;
  };
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      if (r() < 0.35) continue;
      const cx = 30 + col * 27 + (row % 2) * 13.5;
      const cy = 82 + row * 23;
      hex += `<path d="${hx(cx, cy, 14)}" fill="${C.cyan}" fill-opacity="${fmt(0.02 + r() * 0.07, 2)}" stroke="${C.cyan}" stroke-opacity=".18"/>`;
    }
  }

  let net = '';
  const nodes = [...Array(9)].map(() => [900 + r() * 85, 70 + r() * 105]);
  nodes.forEach((a, i) => {
    nodes.slice(i + 1).forEach((b) => {
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 55) net += `<path d="M${fmt(a[0], 1)} ${fmt(a[1], 1)}L${fmt(b[0], 1)} ${fmt(b[1], 1)}"/>`;
    });
  });
  net = `<g stroke="${C.cyan}" stroke-opacity=".22">${net}</g>` +
    nodes.map(([x, y], i) => `<circle cx="${fmt(x, 1)}" cy="${fmt(y, 1)}" r="${i % 3 ? 1.6 : 2.6}" fill="${C.cyan}" fill-opacity=".7"/>`).join('');

  let floor = '';
  const vx = 500;
  const vy = 455;
  for (let x = -700; x <= 1700; x += 85) floor += `M${vx} ${vy}L${x} ${H}`;
  for (const y of [548, 562, 580, 603, 632]) floor += `M0 ${y}H${W}`;
  floor = `<path d="${floor}" stroke="${C.cyan}" stroke-opacity=".16" fill="none" mask="url(#floorMask)"/>`;

  // Side rulers with a travelling indicator.
  let ruler = '';
  for (const x of [10, W - 10]) {
    let ticks = '';
    for (let y = 210; y <= 520; y += 14) ticks += `M${x} ${y}h${(y - 210) % 70 === 0 ? (x < 500 ? 8 : -8) : x < 500 ? 4 : -4}`;
    ruler += `<path d="M${x} 210V520${ticks}" stroke="${C.cyan}" stroke-opacity=".3" fill="none"/>` +
      `<circle class="scan-y" cx="${x}" cy="210" r="2.5" fill="${C.cyan}"/>`;
  }
  return hex + net + floor + ruler;
}

function orbit({ cx, cy, rx, ry, rot, color, dur, id }) {
  const a = (rot * Math.PI) / 180;
  const pt = (t) => {
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    return [fmt(cx + x * Math.cos(a) - y * Math.sin(a), 1), fmt(cy + x * Math.sin(a) + y * Math.cos(a), 1)];
  };
  const half = (t0, t1) => {
    let d = '';
    for (let i = 0; i <= 40; i++) {
      const [x, y] = pt(t0 + ((t1 - t0) * i) / 40);
      d += `${i ? 'L' : 'M'}${x} ${y}`;
    }
    return d;
  };
  // Back half = the upper arc (t from 0 to -π), drawn behind the globe.
  const back = half(0, -Math.PI);
  const front = half(Math.PI, 0);
  const sat = (path, show) =>
    `<circle class="sat" r="3" fill="${color}" filter="url(#glow)"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${path}" keyPoints="${show ? '0;0;1' : '0;1;1'}" keyTimes="0;.5;1" calcMode="linear"/>` +
    `<animate attributeName="opacity" dur="${dur}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;.5" values="${show ? '0;1' : '1;0'}"/></circle>`;
  return {
    back: `<path id="${id}b" d="${back}" fill="none" stroke="${color}" stroke-opacity=".22"/>` + sat(back, false),
    front: `<path d="${front}" fill="none" stroke="${color}" stroke-opacity=".45"/>` + sat(front, true),
  };
}

export function renderDashboard(profile, stats, { syncedAt = new Date() } = {}) {
  const g = globe({ cx: 500, cy: 392, R: 166 });
  const base = cardBase(W, H, 'db');
  const o1 = orbit({ cx: 500, cy: 392, rx: 300, ry: 62, rot: -9, color: C.cyan, dur: 14, id: 'o1' });
  const o2 = orbit({ cx: 500, cy: 400, rx: 262, ry: 88, rot: 13, color: C.gold, dur: 19, id: 'o2' });

  // ---- top panels -------------------------------------------------------
  const P = { y: 66, h: 100, w: 244 };
  const px = [116, 378, 640];

  const contrib = profile.contributionsYear;
  const level = contrib >= 1000 ? 'Elite' : contrib >= 500 ? 'High' : contrib >= 200 ? 'Active' : contrib >= 50 ? 'Steady' : 'Warming up';
  const needle = -90 + 180 * Math.min(1, Math.log1p(contrib) / Math.log1p(1500));
  const g1 = { x: px[0] + 44, y: P.y + 70 };
  const panel1 =
    panel(px[0], P.y, P.w, P.h) +
    `<text class="lbl" x="${px[0] + 14}" y="${P.y + 22}">TOTAL CONTRIBUTIONS</text>` + chevrons(px[0] + P.w - 26, P.y + 13) +
    `<path d="M${g1.x - 26} ${g1.y}A26 26 0 0 1 ${g1.x + 26} ${g1.y}" fill="none" stroke="url(#gaugeGrad)" stroke-width="6" stroke-linecap="round"/>` +
    `<g class="needle" style="--a:${fmt(needle, 1)}deg;transform-origin:${g1.x}px ${g1.y}px"><path d="M${g1.x - 1.6} ${g1.y}L${g1.x} ${g1.y - 24}L${g1.x + 1.6} ${g1.y}Z" fill="#fff"/></g>` +
    `<circle cx="${g1.x}" cy="${g1.y}" r="4" fill="${C.panel}" stroke="#fff" stroke-width="1.5"/>` +
    `<text class="cap" x="${g1.x}" y="${g1.y + 18}" text-anchor="middle">${level}</text>` +
    `<text class="big" x="${px[0] + 92}" y="${P.y + 56}">${nf(contrib)}</text>` +
    `<text class="unit" x="${px[0] + 94}" y="${P.y + 70}">last 12 months</text>` +
    sparkline(stats.weekly.slice(-26), px[0] + 94, P.y + 74, 136, 18);

  const streakState = stats.currentStreak >= 7 ? 'On fire' : stats.currentStreak >= 1 ? 'Active' : 'Standby';
  const panel2 =
    panel(px[1], P.y, P.w, P.h) +
    `<text class="lbl" x="${px[1] + 14}" y="${P.y + 22}">CURRENT STREAK</text>` + chevrons(px[1] + P.w - 26, P.y + 13) +
    `<text class="big" x="${px[1] + 14}" y="${P.y + 56}">${nf(stats.currentStreak)}<tspan class="unitIn" dx="6">${stats.currentStreak === 1 ? 'day' : 'days'}</tspan></text>` +
    `<text class="ok" x="${px[1] + P.w - 14}" y="${P.y + 44}" text-anchor="end">${streakState}</text>` +
    `<text class="unit" x="${px[1] + P.w - 14}" y="${P.y + 58}" text-anchor="end">longest ${nf(stats.longestStreak)}d</text>` +
    bars(stats.daily, px[1] + 14, P.y + 66, P.w - 28, 22);

  const pct = (100 * stats.activeDays) / Math.max(1, stats.totalDays);
  const activeWord = pct >= 60 ? 'Excellent' : pct >= 35 ? 'Great' : pct >= 15 ? 'Good' : 'Warming up';
  const g3 = { x: px[2] + 44, y: P.y + 62 };
  const panel3 =
    panel(px[2], P.y, P.w, P.h) +
    `<text class="lbl" x="${px[2] + 14}" y="${P.y + 22}">ACTIVE DAYS</text>` + chevrons(px[2] + P.w - 26, P.y + 13) +
    `<circle cx="${g3.x}" cy="${g3.y}" r="25" fill="none" stroke="${C.line}" stroke-width="5"/>` +
    `<circle class="ring" pathLength="100" cx="${g3.x}" cy="${g3.y}" r="25" fill="none" stroke="url(#ringGrad)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${fmt(pct, 1)} 100" style="--p:${fmt(pct, 1)}" transform="rotate(-90 ${g3.x} ${g3.y})"/>` +
    `<text class="ringTxt" x="${g3.x}" y="${g3.y + 4}" text-anchor="middle">${Math.round(pct)}%</text>` +
    `<text class="big" x="${px[2] + 86}" y="${P.y + 56}">${nf(stats.activeDays)}<tspan class="unitIn" dx="5">/ ${stats.totalDays}</tspan></text>` +
    `<text class="ok" x="${px[2] + 88}" y="${P.y + 74}">${activeWord}</text>` +
    bars(stats.monthly, px[2] + 160, P.y + 62, 70, 26, C.blue);

  // ---- side panels ------------------------------------------------------
  const langs = profile.languages.slice(0, 5);
  const allSize = profile.languages.reduce((n, x) => n + x.size, 0) || 1;
  const L = { x: 24, y: 196, w: 236, h: 182 };
  let langRows = '';
  langs.forEach((l, i) => {
    const y = L.y + 46 + i * 27;
    const share = (100 * l.size) / allSize;
    const w = Math.max(2, ((L.w - 28) * l.size) / langs[0].size);
    langRows +=
      `<circle cx="${L.x + 18}" cy="${y - 4}" r="3.5" fill="${l.color}"/>` +
      `<text class="row" x="${L.x + 28}" y="${y}">${esc(l.name)}</text>` +
      `<text class="rowVal" x="${L.x + L.w - 14}" y="${y}" text-anchor="end">${fmt(share, 1)}%</text>` +
      `<rect x="${L.x + 14}" y="${y + 6}" width="${L.w - 28}" height="3" rx="1.5" fill="${C.line}"/>` +
      `<rect class="grow-x" style="animation-delay:${fmt(0.5 + i * 0.12, 2)}s" x="${L.x + 14}" y="${y + 6}" width="${fmt(w, 1)}" height="3" rx="1.5" fill="url(#barGrad)"/>`;
  });
  const leftPanel =
    panel(L.x, L.y, L.w, L.h) +
    `<text class="lbl" x="${L.x + 14}" y="${L.y + 22}">TOP LANGUAGES</text>` + chevrons(L.x + L.w - 26, L.y + 13) + langRows;

  const online = stats.daysSinceActive <= 7 ? ['OPTIMAL', C.ok] : stats.daysSinceActive <= 30 ? ['ONLINE', C.ok] : ['STANDBY', C.gold];
  const R = { x: 740, y: 196, w: 236, h: 182 };
  const rows = [
    ['Commits (1y)', nf(profile.commitsYear)],
    ['Pull requests', nf(profile.pullRequests)],
    ['Issues', nf(profile.issues)],
    ['Longest streak', `${nf(stats.longestStreak)}d`],
    ['Followers', nf(profile.followers)],
    ['On GitHub', `${Math.floor(stats.years)} yrs`],
  ];
  const rightPanel =
    panel(R.x, R.y, R.w, R.h) +
    `<text class="lbl" x="${R.x + 14}" y="${R.y + 22}">NETWORK STATUS:</text>` + chevrons(R.x + R.w - 26, R.y + 13) +
    `<text class="status" x="${R.x + 14}" y="${R.y + 46}" fill="${online[1]}">${online[0]}</text>` +
    `<circle class="blink" cx="${R.x + R.w - 18}" cy="${R.y + 41}" r="3.5" fill="${online[1]}"/>` +
    rows.map(([k, v], i) => {
      const y = R.y + 70 + i * 18.5;
      return `<text class="row" x="${R.x + 14}" y="${y}">${k}</text>` +
        `<path d="M${R.x + 118} ${y - 4}H${R.x + R.w - 64}" stroke="${C.cyan}" stroke-opacity=".25" stroke-dasharray="1 4"/>` +
        `<text class="rowVal" x="${R.x + R.w - 14}" y="${y}" text-anchor="end">${v}</text>`;
    }).join('');

  // ---- bottom widgets -----------------------------------------------------
  const HB = { x: 24, y: 404, w: 236, h: 118 };
  const cycle = GREETINGS.length * 1.8;
  const hello =
    panel(HB.x, HB.y, HB.w, HB.h) +
    `<text class="lbl" x="${HB.x + 14}" y="${HB.y + 22}">HELLO.EXE</text>` +
    `<text class="unit" x="${HB.x + HB.w - 14}" y="${HB.y + 22}" text-anchor="end">${GREETINGS.length} languages</text>` +
    GREETINGS.map((w, i) =>
      `<text class="hw${i ? '' : ' hw0'}" style="animation-delay:${fmt(i * 1.8, 1)}s" x="${HB.x + HB.w / 2}" y="${HB.y + 72}" text-anchor="middle">${esc(w)}</text>`).join('') +
    `<text class="cap" x="${HB.x + HB.w / 2}" y="${HB.y + 104}" text-anchor="middle">[ Think &amp; Do ]</text>`;

  const NB = { x: 740, y: 404, w: 236, h: 118 };
  const rc = { x: NB.x + 46, y: NB.y + 68 };
  const node =
    panel(NB.x, NB.y, NB.w, NB.h) +
    `<text class="lbl" x="${NB.x + 14}" y="${NB.y + 22}">NODE // TR</text>` + chevrons(NB.x + NB.w - 26, NB.y + 13) +
    `<circle cx="${rc.x}" cy="${rc.y}" r="30" fill="none" stroke="${C.cyan}" stroke-opacity=".35"/>` +
    `<circle cx="${rc.x}" cy="${rc.y}" r="18" fill="none" stroke="${C.cyan}" stroke-opacity=".2"/>` +
    `<path d="M${rc.x - 30} ${rc.y}H${rc.x + 30}M${rc.x} ${rc.y - 30}V${rc.y + 30}" stroke="${C.cyan}" stroke-opacity=".15"/>` +
    `<g class="sweep" style="transform-origin:${rc.x}px ${rc.y}px"><path d="M${rc.x} ${rc.y}L${rc.x + 30} ${rc.y}A30 30 0 0 0 ${fmt(rc.x + 30 * Math.cos(-0.7), 1)} ${fmt(rc.y + 30 * Math.sin(-0.7), 1)}Z" fill="url(#sweepGrad)"/></g>` +
    `<circle class="blink" cx="${rc.x + 11}" cy="${rc.y - 9}" r="2.2" fill="${C.gold}"/>` +
    [
      ['GEO', '41.0°N 37.9°E'],
      ['ZONE', 'UTC+03:00'],
      ['UPTIME', `${fmt(stats.years, 1)} yrs`],
      ['SYNC', syncedAt.toISOString().slice(0, 10)],
    ].map(([k, v], i) => {
      const y = NB.y + 46 + i * 18;
      return `<text class="key" x="${NB.x + 88}" y="${y}">${k}</text><text class="rowVal sm" x="${NB.x + NB.w - 14}" y="${y}" text-anchor="end">${esc(v)}</text>`;
    }).join('');

  // ---- platform under the globe ---------------------------------------------
  const platform =
    `<ellipse cx="500" cy="586" rx="236" ry="31" fill="none" stroke="${C.cyan}" stroke-opacity=".18"/>` +
    `<ellipse cx="500" cy="586" rx="196" ry="25" fill="url(#padFill)" stroke="${C.cyan}" stroke-width="2.5" filter="url(#glowBig)"/>` +
    `<ellipse class="spinDash" cx="500" cy="586" rx="196" ry="25" fill="none" stroke="${C.goldHi}" stroke-width="2.5" stroke-dasharray="60 540" pathLength="600"/>` +
    `<ellipse class="spinDash rev" cx="500" cy="586" rx="156" ry="19" fill="none" stroke="${C.cyan}" stroke-opacity=".55" stroke-dasharray="3 9"/>`;

  const title =
    `<g filter="url(#glow)"><text class="ttl" x="500" y="40" text-anchor="middle">GLOBAL CONNECTIVITY &amp; PERFORMANCE METRICS</text></g>` +
    `<path d="M210 52H790" stroke="url(#ttlLine)" stroke-width="1.5"/><circle cx="500" cy="52" r="2.5" fill="#fff" filter="url(#glow)"/>` +
    // globe icon (top left) and menu (top right), as in a HUD frame
    `<g fill="none" stroke="${C.cyan}" stroke-opacity=".8" stroke-width="1.3"><circle cx="34" cy="34" r="10"/><ellipse cx="34" cy="34" rx="4.5" ry="10"/><path d="M24 34H44"/></g>` +
    `<path d="M956 28H974M956 34H974M956 40H974" stroke="${C.cyan}" stroke-opacity=".8" stroke-width="1.6"/>`;

  const footer = `<text class="foot" x="500" y="${H - 14}" text-anchor="middle">${esc(profile.login)}  //  [ Think &amp; Do ]  //  levántarse y brillar</text>`;

  const defs =
    base.defs + panelDefs + g.defs +
    `<linearGradient id="ttlFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>` +
    `<linearGradient id="ttlLine"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".5" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="gaugeGrad"><stop offset="0" stop-color="${C.cyan}"/><stop offset=".45" stop-color="${C.ok}"/><stop offset=".75" stop-color="${C.gold}"/><stop offset="1" stop-color="#ff5d6c"/></linearGradient>` +
    `<linearGradient id="ringGrad" x1="0" x2="1"><stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>` +
    `<linearGradient id="barGrad"><stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>` +
    `<linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".35"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>` +
    `<radialGradient id="padFill"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".18"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="sweepGrad" x1="1" x2="0"><stop offset="0" stop-color="${C.cyan}" stop-opacity=".6"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>` +
    `<radialGradient id="space" cx=".5" cy=".58" r=".7"><stop offset="0" stop-color="#0b2a5c"/><stop offset=".55" stop-color="#041230"/><stop offset="1" stop-color="${C.bg0}"/></radialGradient>` +
    `<linearGradient id="floorFade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>` +
    `<mask id="floorMask"><rect y="520" width="${W}" height="${H - 520}" fill="url(#floorFade)"/></mask>`;

  const css =
    fontFaces({ mono: [400, 700], display: [500, 700] }) + starsCss + g.css +
    `text{font-family:${MONO}}` +
    `.ttl{font:700 20px ${DISPLAY};letter-spacing:2px;fill:url(#ttlFill)}` +
    `.lbl{font:500 11px ${DISPLAY};letter-spacing:1.4px;fill:#d6ecff}` +
    `.big{font:700 26px ${DISPLAY};fill:#fff}` +
    `.unit{font-size:10px;fill:${C.mute}}.unitIn{font:400 13px ${MONO};fill:${C.mute}}` +
    `.cap{font-size:10.5px;fill:${C.mute}}.ok{font:700 12.5px ${MONO};fill:${C.ok}}` +
    `.status{font:700 16px ${DISPLAY};letter-spacing:1.5px}` +
    `.row{font-size:12px;fill:#cfe3f7}.rowVal{font:700 12.5px ${MONO};fill:${C.cyan}}.sm{font-size:11px}` +
    `.key{font-size:9.5px;letter-spacing:1px;fill:${C.mute}}` +
    `.ringTxt{font:700 11px ${DISPLAY};fill:#fff}` +
    `.foot{font-size:10.5px;letter-spacing:2px;fill:${C.mute}}` +
    `.hw{font:700 26px ${MONO},system-ui,sans-serif;fill:#fff;opacity:0;animation:hw ${fmt(cycle, 1)}s infinite both}` +
    `@keyframes hw{0%{opacity:0;transform:translateY(8px)}1.6%,5%{opacity:1;transform:none}6.25%,100%{opacity:0;transform:translateY(-6px)}}` +
    `.chev{animation:chev 1.6s infinite}.c1{animation-delay:.25s}@keyframes chev{0%,100%{opacity:.25}50%{opacity:1}}` +
    `.draw{stroke-dasharray:1;animation:draw 2.2s ease-out .4s both}@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}` +
    `.blink{animation:blink 1.4s ease-in-out infinite}@keyframes blink{50%{opacity:.25}}` +
    `.needle{transform:rotate(var(--a));animation:needle 2s cubic-bezier(.2,1.4,.4,1) .3s both}@keyframes needle{from{transform:rotate(-90deg)}to{transform:rotate(var(--a))}}` +
    `.ring{animation:ring 2s ease-out .3s both}@keyframes ring{from{stroke-dasharray:0 100}}` +
    `.grow-x,.grow-y{transform-box:fill-box;animation:gx2 1.2s cubic-bezier(.2,.8,.2,1) both}.grow-x{transform-origin:left}.grow-y{transform-origin:bottom;animation-name:gy2}` +
    `@keyframes gx2{from{transform:scaleX(0)}}@keyframes gy2{from{transform:scaleY(0)}}` +
    `.sweep{animation:sweep 3s linear infinite}@keyframes sweep{to{transform:rotate(360deg)}}` +
    `.spinDash{animation:dash 9s linear infinite}.rev{animation-duration:14s;animation-direction:reverse}@keyframes dash{to{stroke-dashoffset:-600}}` +
    `.scan-y{animation:scanY 6s ease-in-out infinite alternate}@keyframes scanY{to{transform:translateY(310px)}}` +
    `@media (prefers-reduced-motion:reduce){.draw,.needle,.ring,.grow-x,.grow-y,.hw{animation:none}.hw0{opacity:1}.arcs,.sat{display:none}*{animation-play-state:paused!important}}`;

  const body =
    `<g clip-path="${base.clip}">` +
    `<rect width="${W}" height="${H}" fill="url(#space)"/>` +
    stars(W, H, 170, 3) + ornaments() +
    platform + o1.back + o2.back + g.body + o1.front + o2.front +
    title + panel1 + panel2 + panel3 + leftPanel + rightPanel + hello + node + footer +
    `</g>` + base.edge;

  return svg({
    w: W,
    h: H,
    title: `${profile.name} — global connectivity & GitHub metrics`,
    desc: `${nf(contrib)} contributions in the last year, ${stats.currentStreak}-day streak (longest ${stats.longestStreak}), ${profile.followers} followers. A rotating globe with arcs from Türkiye to the world.`,
    defs,
    css,
    body,
  });
}
