// A rotating 3D dot globe in pure SVG + CSS (GitHub READMEs cannot run JS).
//
// Spinning around the vertical axis, every point of a latitude circle traces
// the same ellipse on screen: x = c·sin(ψ), y = y0 + c·sin(tilt)·cos(ψ), with c
// the radius of that circle. So each row gets one static transform (y0, c),
// all dots share one unit-ellipse keyframe, and a dot's longitude is only its
// animation delay. Whether a dot faces us depends on latitude alone, so the
// front/back fade is one keyframe per latitude bucket.
import { readFileSync } from 'node:fs';
import { C, fmt } from './theme.mjs';

const RAD = Math.PI / 180;
const TAU = Math.PI * 2;
const mod = (x, m) => ((x % m) + m) % m;

const LAND = JSON.parse(readFileSync(new URL('../../data/land-dots.json', import.meta.url), 'utf8')).dots;

export const HOME = { name: 'Ordu', lat: 40.98, lon: 37.88 };

// Arcs leave home towards these places (Vilnius: Erasmus, the rest: the world).
export const DESTINATIONS = [
  { name: 'Vilnius', lat: 54.69, lon: 25.28, color: 'c' },
  { name: 'London', lat: 51.51, lon: -0.13, color: 'g' },
  { name: 'New York', lat: 40.71, lon: -74.01, color: 'c' },
  { name: 'San Francisco', lat: 37.77, lon: -122.42, color: 'g' },
  { name: 'Tokyo', lat: 35.68, lon: 139.69, color: 'c' },
  { name: 'Singapore', lat: 1.35, lon: 103.82, color: 'g' },
  { name: 'Dubai', lat: 25.2, lon: 55.27, color: 'c' },
  { name: 'Cape Town', lat: -33.92, lon: 18.42, color: 'g' },
  { name: 'São Paulo', lat: -23.55, lon: -46.63, color: 'c' },
];

// Land dots near these cities glow gold, like city lights at night.
const CITY_LIGHTS = [
  [40.7, -74], [34, -118.2], [41.9, -87.6], [19.4, -99.1], [-23.5, -46.6], [-34.6, -58.4], [4.7, -74.1],
  [-12, -77], [51.5, -0.1], [48.9, 2.35], [40.4, -3.7], [52.5, 13.4], [41.9, 12.5], [55.75, 37.6],
  [41, 29], [39.9, 32.9], [41, 37.9], [30, 31.2], [6.5, 3.4], [-26.2, 28], [-1.3, 36.8], [25.2, 55.3],
  [35.7, 51.4], [24.7, 46.7], [24.9, 67], [28.6, 77.2], [19.1, 72.9], [22.6, 88.4], [23.8, 90.4],
  [13.75, 100.5], [1.35, 103.8], [-6.2, 106.8], [14.6, 121], [22.3, 114.2], [31.2, 121.5], [39.9, 116.4],
  [37.6, 127], [35.7, 139.7], [-33.9, 151.2], [-37.8, 145], [43.7, -79.4], [37.8, -122.4], [47.6, -122.3],
  [25.8, -80.2], [54.7, 25.3], [50.45, 30.5], [52.2, 21], [59.3, 18.1], [45.5, -73.6], [-33.9, 18.4],
];

const angDist = (a, b) => {
  const s = Math.sin(((b[0] - a[0]) * RAD) / 2) ** 2 +
    Math.cos(a[0] * RAD) * Math.cos(b[0] * RAD) * Math.sin(((b[1] - a[1]) * RAD) / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(s)));
};

const toVec = (lat, lon) => [
  Math.cos(lat * RAD) * Math.cos(lon * RAD),
  Math.cos(lat * RAD) * Math.sin(lon * RAD),
  Math.sin(lat * RAD),
];

// Points along the great circle from a to b, lifted into an arc.
function arcPoints(a, b, spacing, R) {
  const d = angDist([a.lat, a.lon], [b.lat, b.lon]);
  const lift = 0.07 + 0.3 * (d / Math.PI);
  const n = Math.max(10, Math.round((d * R * (1 + lift / 2)) / spacing));
  const va = toVec(a.lat, a.lon);
  const vb = toVec(b.lat, b.lon);
  const pts = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const s1 = Math.sin((1 - t) * d) / Math.sin(d);
    const s2 = Math.sin(t * d) / Math.sin(d);
    const v = va.map((x, k) => s1 * x + s2 * vb[k]);
    pts.push({
      lat: Math.asin(Math.max(-1, Math.min(1, v[2]))) / RAD,
      lon: Math.atan2(v[1], v[0]) / RAD,
      r: R * (1 + lift * Math.sin(Math.PI * t)),
      t,
    });
  }
  return pts;
}

export function globe({
  cx,
  cy,
  R,
  tilt = 20,
  period = 60,
  faceLon = HOME.lon + 8,
  home = HOME,
  destinations = DESTINATIONS,
  dot = 1.6,
  arcSpacing = 26,
  frames = 45,
  buckets = 25,
  id = 'gl',
}) {
  const a = tilt * RAD;
  const sinA = Math.sin(a);
  const cosA = Math.cos(a);
  const theta0 = -faceLon * RAD;
  const used = new Set();

  // Keyframes start with the dot at the back centre (ψ = π).
  const delay = (lon) => -fmt((mod(lon * RAD + theta0 - Math.PI, TAU) / TAU) * period, 2);

  // Front/back visibility depends only on latitude: visible while cos(ψ) > k.
  const bucketOf = (lat) => {
    const k = Math.max(-1, Math.min(1, -Math.tan(lat * RAD) * Math.tan(a)));
    const b = Math.round(((k + 1) / 2) * (buckets - 1));
    used.add(b);
    return b;
  };

  // Latitude circle at radius r: one static transform for everything on it.
  const ring = (lat, r) =>
    `<g transform="translate(${cx} ${fmt(cy - r * Math.sin(lat * RAD) * cosA)}) scale(${fmt(r * Math.cos(lat * RAD), 3)})">`;

  const isLit = (lat, lon) => CITY_LIGHTS.some((p) => angDist(p, [lat, lon]) < 2.3 * RAD);

  // Land, grouped by latitude row.
  let landSvg = '';
  const rows = new Map();
  for (const [lat, lon] of LAND) (rows.get(lat) ?? rows.set(lat, []).get(lat)).push(lon);
  for (const [lat, lons] of rows) {
    const b = bucketOf(lat);
    const c = R * Math.cos(lat * RAD);
    const rl = fmt(dot / c, 4);
    const rc = fmt((dot * 1.3) / c, 4);
    landSvg += ring(lat, R);
    for (const lon of lons) {
      const lit = isLit(lat, lon);
      landSvg += `<circle class="d${b}${lit ? ' cl' : ''}" r="${lit ? rc : rl}" style="--d:${delay(lon)}s"/>`;
    }
    landSvg += '</g>';
  }

  // Arcs: solid glowing lines. A CSS transform cannot bend a path over a
  // sphere, so each arc's projected shape is precomputed for `frames` steps
  // of one revolution and morphed with SMIL (<animate attributeName="d">).
  // Points that slip behind the globe are pinned to the limb crossing.
  const project = (p, theta) => {
    const psi = p.lon * RAD + theta;
    const c = p.r * Math.cos(p.lat * RAD);
    const x = c * Math.sin(psi);
    const y = -p.r * Math.sin(p.lat * RAD) * cosA + c * sinA * Math.cos(psi);
    const depth = p.r * Math.sin(p.lat * RAD) * sinA + c * cosA * Math.cos(psi);
    return { x: cx + x, y: cy + y, s: Math.max(depth / R, (Math.hypot(x, y) - R) / R) };
  };
  const lerp = (p, q) => {
    const t = p.s / (p.s - q.s);
    return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
  };
  let arcDefs = '';
  let arcSvg = '';
  destinations.forEach((dest, i) => {
    const pts = [{ ...home, r: R, t: 0 }, ...arcPoints(home, dest, arcSpacing, R), { ...dest, r: R, t: 1 }];
    const shapes = [];
    const opac = [];
    for (let f = 0; f <= frames; f++) {
      const P = pts.map((p) => project(p, theta0 + (TAU * f) / frames));
      // Longest visible run.
      let best = null;
      for (let j = 0, run = null; j <= P.length; j++) {
        if (j < P.length && P[j].s > 0) run = run ? [run[0], j] : [j, j];
        else if (run) {
          if (!best || run[1] - run[0] > best[1] - best[0]) best = run;
          run = null;
        }
      }
      let Q;
      if (!best) {
        Q = P.map(() => P[0]);
        opac.push(0);
      } else {
        const [i0, i1] = best;
        const a0 = i0 > 0 ? lerp(P[i0], P[i0 - 1]) : P[0];
        const a1 = i1 < P.length - 1 ? lerp(P[i1], P[i1 + 1]) : P[i1];
        Q = P.map((p, j) => (j < i0 ? a0 : j > i1 ? a1 : p));
        opac.push(1);
      }
      let d = `M${fmt(Q[0].x, 1)} ${fmt(Q[0].y, 1)}l`;
      for (let j = 1; j < Q.length; j++) d += `${fmt(Q[j].x - Q[j - 1].x, 1)} ${fmt(Q[j].y - Q[j - 1].y, 1)} `;
      shapes.push(d.trim());
    }
    const col = dest.color === 'g' ? C.gold : C.cyan;
    arcDefs +=
      `<path id="${id}A${i}" pathLength="100" d="${shapes[0]}" opacity="${opac[0]}">` +
      `<animate attributeName="d" dur="${period}s" repeatCount="indefinite" values="${shapes.join(';')}"/>` +
      `<animate attributeName="opacity" dur="${period}s" repeatCount="indefinite" values="${opac.join(';')}"/></path>`;
    arcSvg +=
      `<use href="#${id}A${i}" stroke="${col}" stroke-width="5" stroke-opacity=".16"/>` +
      `<use href="#${id}A${i}" stroke="${col}" stroke-width="1.4" stroke-opacity=".85"/>` +
      `<use href="#${id}A${i}" class="flow" style="animation-delay:-${fmt((i * 0.61) % 2.6, 2)}s" stroke="${dest.color === 'g' ? C.goldHi : '#e8fdff'}" stroke-width="2.4"/>`;
  });

  // City markers and the pulsing home node.
  const marker = (lat, lon, inner) => {
    const c = R * Math.cos(lat * RAD);
    return ring(lat, R) + `<g class="d${bucketOf(lat)}" style="--d:${delay(lon)}s">${inner(c)}</g></g>`;
  };
  let markerSvg = '';
  for (const dest of destinations) {
    const col = dest.color === 'g' ? C.gold : C.cyan;
    markerSvg += marker(dest.lat, dest.lon, (c) =>
      `<circle r="${fmt(2.6 / c, 4)}" fill="${col}"/><circle r="${fmt(5.5 / c, 4)}" fill="none" stroke="${col}" stroke-opacity=".7" stroke-width="${fmt(1 / c, 4)}"/>`);
  }
  markerSvg += marker(home.lat, home.lon, (c) =>
    `<circle r="${fmt(3.4 / c, 4)}" fill="#fff"/>` +
    `<circle class="pulse" r="${fmt(4 / c, 4)}" fill="none" stroke="${C.cyan}" stroke-width="${fmt(1.4 / c, 4)}"/>` +
    `<circle class="pulse p2" r="${fmt(4 / c, 4)}" fill="none" stroke="${C.gold}" stroke-width="${fmt(1.2 / c, 4)}"/>`);

  // Latitude rings are invariant under the spin, so they stay static.
  let grat = '';
  for (const lat of [-60, -30, 0, 30, 60]) {
    const rx = fmt(R * Math.cos(lat * RAD));
    const ry = fmt(R * Math.cos(lat * RAD) * sinA);
    const y = fmt(cy - R * Math.sin(lat * RAD) * cosA);
    grat += `<path d="M${fmt(cx - rx)} ${y}a${rx} ${ry} 0 0 0 ${fmt(2 * rx)} 0" fill="none" stroke="${C.cyan}" stroke-opacity="${lat === 0 ? 0.32 : 0.16}" stroke-width="${lat === 0 ? 1 : 0.8}"/>`;
  }

  // One unit ellipse for every dot (linear between 48 stops ≈ 0.3px error).
  const STOPS = 48;
  let spin = '';
  for (let i = 0; i <= STOPS; i++) {
    const psi = Math.PI + (TAU * i) / STOPS;
    spin += `${fmt((100 * i) / STOPS, 2)}%{transform:translate(${fmt(Math.sin(psi), 4)}px,${fmt(sinA * Math.cos(psi), 4)}px)}`;
  }

  const BACK = 0.06;
  let css =
    `@keyframes sp{${spin}}` +
    `.flow{stroke-dasharray:14 86;stroke-linecap:round;animation:flow 2.6s linear infinite}` +
    `@keyframes flow{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}` +
    `.pulse{animation:pulse 2.4s ease-out infinite}.p2{animation-delay:-1.2s}` +
    `@keyframes pulse{from{transform:scale(1);opacity:1}to{transform:scale(4.5);opacity:0}}`;
  const base = (b) => `sp ${period}s linear infinite,v${b} ${period}s linear infinite`;
  for (const b of [...used].sort((x, y) => x - y)) {
    const k = -1 + (2 * b) / (buckets - 1);
    css += `@keyframes v${b}{${fadeStops(k, BACK)}}`;
    css += `.d${b}{fill:#5ccfff;animation:${base(b)};animation-delay:var(--d)}`;
  }
  css += `.cl{fill:${C.gold}}`;

  const defs =
    arcDefs +
    `<radialGradient id="${id}Halo"><stop offset=".72" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".8" stop-color="${C.cyan}" stop-opacity=".38"/><stop offset=".86" stop-color="${C.blue}" stop-opacity=".14"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${id}Body" cx=".42" cy=".36" r=".72"><stop offset="0" stop-color="#0f3d78"/><stop offset=".55" stop-color="#071f47"/><stop offset="1" stop-color="#030b1f"/></radialGradient>` +
    `<radialGradient id="${id}Rim"><stop offset=".78" stop-color="${C.cyan}" stop-opacity="0"/><stop offset=".97" stop-color="${C.cyan}" stop-opacity=".28"/><stop offset="1" stop-color="#bff6ff" stop-opacity=".7"/></radialGradient>` +
    `<radialGradient id="${id}Spec" cx=".35" cy=".28" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;

  const body =
    `<circle cx="${cx}" cy="${cy}" r="${fmt(R * 1.25)}" fill="url(#${id}Halo)"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}Body)"/>` +
    grat +
    `<g>${landSvg}</g><g class="arcs" fill="none" stroke-linecap="round" stroke-linejoin="round">${arcSvg}</g><g>${markerSvg}</g>` +
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}Rim)"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}Spec)"/>`;

  return { defs, css, body };
}

// Opacity over one revolution (0% = back centre, 50% = front centre).
function fadeStops(k, back) {
  if (k >= 1) return `0%,100%{opacity:${back}}`;
  const f1 = k <= -1 ? 0 : Math.acos(-k) / TAU;
  const f2 = 1 - f1;
  const pct = (f) => `${fmt(f * 100, 2)}%`;
  const at = (f) => {
    const depth = (-Math.cos(TAU * f) - k) / (1 - k);
    return fmt(0.32 + 0.68 * Math.min(1, Math.max(0, depth) * 2.2), 3);
  };
  const stops = [];
  if (f1 > 0.012) stops.push(`0%,${pct(f1 - 0.012)}{opacity:${back}}`);
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const f = f1 + ((f2 - f1) * i) / n;
    const e = i === 0 ? Math.min(0.004, (f2 - f1) / 4) : i === n ? -Math.min(0.004, (f2 - f1) / 4) : 0;
    stops.push(`${pct(f + e)}{opacity:${at(f + e)}}`);
  }
  if (f2 < 0.988) stops.push(`${pct(f2 + 0.012)},100%{opacity:${back}}`);
  return stops.join('');
}
