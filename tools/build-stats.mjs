// Writes data/stats.json for the Network tab: contributions calendar,
// languages and counters from the GitHub GraphQL API. Runs in the Pages
// workflow with the built-in GITHUB_TOKEN.
//   GITHUB_TOKEN=... node tools/build-stats.mjs data/stats.json
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fetchProfile } from '../github-profile/scripts/lib/github.mjs';

const out = process.argv[2] ?? 'data/stats.json';
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN is required.');
  process.exit(1);
}

const profile = await fetchProfile({
  token,
  login: process.env.GH_LOGIN || 'kazimanilaydin',
  featured: [],
  hiddenLanguages: (process.env.HIDE_LANGUAGES ?? 'Jupyter Notebook').split(',').map((s) => s.trim()).filter(Boolean),
});
delete profile.featured;
profile.languages = profile.languages.slice(0, 8);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), ...profile }));
console.log(`${out}: ${profile.contributionsYear} contributions, ${profile.languages.length} languages`);
