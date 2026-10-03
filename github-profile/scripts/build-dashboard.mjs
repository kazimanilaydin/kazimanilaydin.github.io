// Live cards: the globe dashboard (+ optional repository cards).
// Runs in GitHub Actions (see .github/workflows/profile.yml) with no npm deps.
//
//   GITHUB_TOKEN=... node scripts/build-dashboard.mjs [--out dist]
//   node scripts/build-dashboard.mjs --sample --out preview   # offline preview
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchProfile, deriveStats } from './lib/github.mjs';
import { renderDashboard } from './lib/dashboard.mjs';
import { renderRepoCard } from './lib/repo-card.mjs';
import { sampleProfile } from './lib/sample-data.mjs';


const args = process.argv.slice(2);
const sample = args.includes('--sample');
const outDir = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'dist';
const list = (v) => v.split(',').map((s) => s.trim()).filter(Boolean);

const login = process.env.GH_LOGIN || 'kazimanilaydin';
// Repo cards are opt-in: FEATURED_REPOS=repo-one,repo-two
const featured = list(process.env.FEATURED_REPOS ?? '');
const hiddenLanguages = list(process.env.HIDE_LANGUAGES ?? 'Jupyter Notebook');
const token = process.env.GITHUB_TOKEN;

if (!sample && !token) {
  console.error('GITHUB_TOKEN is required (or pass --sample for an offline preview).');
  process.exit(1);
}

const profile = sample ? sampleProfile() : await fetchProfile({ token, login, featured, hiddenLanguages });
const stats = deriveStats(profile);

mkdirSync(outDir, { recursive: true });
const write = (name, content) => {
  writeFileSync(join(outDir, name), content);
  console.log(`${join(outDir, name)}  ${(content.length / 1024).toFixed(1)} KB`);
};

write('dashboard.svg', renderDashboard(profile, stats));
profile.featured.forEach((repo, i) => write(`repo-${repo.name}.svg`, renderRepoCard(repo, i)));
