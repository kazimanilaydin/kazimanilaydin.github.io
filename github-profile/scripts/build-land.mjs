// Builds data/land-dots.json: an evenly spaced lat/lon dot grid of the world's
// land masses. The globe renderer reads this file, so the GitHub Action that
// refreshes the dashboard needs no npm dependencies. Run: npm run build:land
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const topology = JSON.parse(readFileSync(require.resolve('world-atlas/land-50m.json'), 'utf8'));
const land = feature(topology, topology.objects.land);

const STEP = 2.6; // degrees between dots
const MIN_LAT = -56; // skip Antarctica
const MAX_LAT = 80;

const dots = [];
let row = 0;
for (let lat = MAX_LAT; lat >= MIN_LAT; lat -= STEP, row++) {
  const count = Math.max(1, Math.round((360 / STEP) * Math.cos((lat * Math.PI) / 180)));
  const offset = row % 2 ? 0.5 : 0;
  for (let i = 0; i < count; i++) {
    const lon = -180 + ((i + offset) * 360) / count;
    if (geoContains(land, [lon, lat])) dots.push([+lat.toFixed(2), +lon.toFixed(2)]);
  }
}

const out = new URL('../data/land-dots.json', import.meta.url);
writeFileSync(out, JSON.stringify({ step: STEP, dots }) + '\n');
console.log(`land-dots.json: ${dots.length} dots`);
