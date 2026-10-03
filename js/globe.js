// WebGL globe for the Network tab (globe.gl, loaded only when the tab opens).

const HOME = { name: 'Ordu, TR', lat: 40.98, lng: 37.88 };
const CITIES = [
  { name: 'Vilnius', lat: 54.69, lng: 25.28 },
  { name: 'London', lat: 51.51, lng: -0.13 },
  { name: 'New York', lat: 40.71, lng: -74.01 },
  { name: 'San Francisco', lat: 37.77, lng: -122.42 },
  { name: 'Tokyo', lat: 35.68, lng: 139.69 },
  { name: 'Singapore', lat: 1.35, lng: 103.82 },
  { name: 'Dubai', lat: 25.2, lng: 55.27 },
  { name: 'Mumbai', lat: 19.08, lng: 72.88 },
  { name: 'Cape Town', lat: -33.92, lng: 18.42 },
  { name: 'São Paulo', lat: -23.55, lng: -46.63 },
];
const byName = Object.fromEntries(CITIES.map((c) => [c.name, c]));
// A few links between other hubs, like a real network map.
const CROSS = [
  ['London', 'New York'],
  ['Dubai', 'Singapore'],
  ['Tokyo', 'San Francisco'],
  ['New York', 'São Paulo'],
  ['Mumbai', 'Singapore'],
];

const CYAN = [59, 232, 255];
const GOLD = [255, 184, 77];
const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;

let scriptPromise;
function loadLibrary() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'vendor/globe.gl.min.js';
    s.onload = () => resolve(window.Globe);
    s.onerror = reject;
    document.head.append(s);
  });
  return scriptPromise;
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function arcsData() {
  const arcs = [];
  const add = (from, to, i, home) => {
    const col = i % 2 ? GOLD : CYAN;
    const alt = i % 2 ? CYAN : GOLD;
    const base = { startLat: from.lat, startLng: from.lng, endLat: to.lat, endLng: to.lng };
    // Solid glowing line…
    arcs.push({ ...base, kind: 'line', color: [rgba(col, home ? 0.85 : 0.45), rgba(alt, home ? 0.85 : 0.45)] });
    // …with a bright pulse travelling along it.
    arcs.push({ ...base, kind: 'pulse', color: ['rgba(255,255,255,0)', rgba(col, 1), '#ffffff'], time: 1800 + ((i * 397) % 1600), gap: (i * 0.137) % 1 });
  };
  CITIES.forEach((c, i) => add(HOME, c, i, true));
  CROSS.forEach(([a, b], i) => add(byName[a], byName[b], i + 1, false));
  return arcs;
}

export async function mountGlobe(el) {
  if (!hasWebGL()) {
    el.innerHTML = '<div class="globe-fallback" role="img" aria-label="Rotating Earth"></div>';
    return { pause() {}, resume() {} };
  }
  const Globe = await loadLibrary();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const globe = new Globe(el, { animateIn: true, rendererConfig: { antialias: true, alpha: true } })
    .backgroundColor('rgba(0,0,0,0)')
    .globeImageUrl('img/earth-hud.jpg')
    .bumpImageUrl('img/earth-topology.png')
    .showAtmosphere(true)
    .atmosphereColor('#3be8ff')
    .atmosphereAltitude(0.22)
    .showGraticules(true)
    // arcs
    .arcsData(arcsData())
    .arcColor('color')
    .arcAltitudeAutoScale(0.42)
    .arcStroke((d) => (d.kind === 'pulse' ? 0.9 : 0.45))
    .arcDashLength((d) => (d.kind === 'pulse' ? 0.18 : 1))
    .arcDashGap((d) => (d.kind === 'pulse' ? 1.2 : 0))
    .arcDashInitialGap((d) => (d.kind === 'pulse' ? d.gap : 0))
    .arcDashAnimateTime((d) => (d.kind === 'pulse' && !reduced ? d.time : 0))
    .arcsTransitionDuration(0)
    // cities
    .pointsData([{ ...HOME, home: true }, ...CITIES])
    .pointColor((d) => (d.home ? '#ffffff' : '#ffb84d'))
    .pointAltitude((d) => (d.home ? 0.035 : 0.012))
    .pointRadius((d) => (d.home ? 0.45 : 0.3))
    .pointLabel((d) => `<div class="globe-tip">${d.name}</div>`)
    // pulsing rings at home and a few hubs
    .ringsData(reduced ? [] : [HOME, byName.Vilnius, byName.London, byName.Tokyo])
    .ringColor((d) => (t) => rgba(d === HOME ? CYAN : GOLD, 1 - t))
    .ringMaxRadius((d) => (d === HOME ? 6 : 3))
    .ringPropagationSpeed(2.4)
    .ringRepeatPeriod((d) => (d === HOME ? 900 : 1600));

  const material = globe.globeMaterial();
  material.bumpScale = 8;
  material.shininess = 14;

  globe.renderer().setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const controls = globe.controls();
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.55;
  controls.enableZoom = false;
  controls.enablePan = false;
  globe.pointOfView({ lat: 26, lng: 30, altitude: 2.25 });

  // Size changes made before the globe texture finishes loading are dropped,
  // so fit again once it is ready.
  const fit = () => {
    const { width } = el.getBoundingClientRect();
    if (width > 0) globe.width(width).height(width);
  };
  new ResizeObserver(fit).observe(el);
  globe.onGlobeReady(() => requestAnimationFrame(fit));
  fit();

  return {
    pause: () => globe.pauseAnimation(),
    resume: () => globe.resumeAnimation(),
  };
}
