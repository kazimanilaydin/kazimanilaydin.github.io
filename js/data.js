// Live numbers for the Network tab.
// 1. data/stats.json, written every 6 hours by .github/workflows/pages.yml
//    (GraphQL with the workflow token: calendar, commits, PRs, issues).
// 2. Fallback for local previews or a plain branch deploy: GitHub's public REST
//    API plus a public contributions calendar, cached for an hour.

export const LOGIN = 'kazimanilaydin';
const CACHE_KEY = 'ka-stats-v1';

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

function readCache() {
  try {
    const hit = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (hit && Date.now() - hit.at < 36e5) return hit.data;
  } catch {}
  return null;
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {}
}

async function fromPublicApis() {
  const since = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
  const count = (q) => getJSON(`https://api.github.com/search/${q}`).then((r) => r.total_count).catch(() => null);
  const [user, repos, calendar, prs, issues, commits] = await Promise.all([
    getJSON(`https://api.github.com/users/${LOGIN}`),
    getJSON(`https://api.github.com/users/${LOGIN}/repos?per_page=100&type=owner`).catch(() => []),
    getJSON(`https://github-contributions-api.jogruber.de/v4/${LOGIN}?y=last`).catch(() => null),
    count(`issues?q=author:${LOGIN}+type:pr&per_page=1`),
    count(`issues?q=author:${LOGIN}+type:issue&per_page=1`),
    count(`commits?q=author:${LOGIN}+committer-date:>${since}&per_page=1`),
  ]);

  // Without per-repo byte counts, weigh each repo's primary language by its size.
  const sizes = new Map();
  for (const r of repos) {
    if (r.fork || !r.language || r.language === 'Jupyter Notebook') continue;
    sizes.set(r.language, (sizes.get(r.language) ?? 0) + Math.max(1, r.size));
  }

  return {
    login: user.login,
    createdAt: user.created_at,
    followers: user.followers,
    publicRepos: user.public_repos,
    stars: repos.reduce((n, r) => n + (r.fork ? 0 : r.stargazers_count), 0),
    pullRequests: prs,
    issues,
    commitsYear: commits,
    contributionsYear: calendar ? calendar.total?.lastYear ?? calendar.contributions.reduce((n, d) => n + d.count, 0) : null,
    calendar: calendar ? calendar.contributions.map((d) => ({ date: d.date, count: d.count })) : [],
    languages: [...sizes].map(([name, size]) => ({ name, size, color: LANG_COLORS[name] ?? '#8b949e' })).sort((a, b) => b.size - a.size),
  };
}

export async function loadStats() {
  try {
    const res = await fetch('data/stats.json', { cache: 'no-cache' });
    if (res.ok) return { source: 'workflow', ...(await res.json()) };
  } catch {}
  const cached = readCache();
  if (cached) return cached;
  const data = { source: 'public-api', generatedAt: new Date().toISOString(), ...(await fromPublicApis()) };
  writeCache(data);
  return data;
}

// Same rules as github-profile/scripts/lib/github.mjs → deriveStats().
export function derive(profile, now = new Date()) {
  const days = [...(profile.calendar ?? [])]
    .filter((d) => d.date <= now.toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-365);
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let current = 0;
  for (; i >= 0 && days[i].count > 0; i--) current++;
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  const weekly = [];
  for (let w = 0; w < days.length; w += 7) weekly.push(days.slice(w, w + 7).reduce((n, d) => n + d.count, 0));
  const months = new Map();
  for (const d of days) months.set(d.date.slice(0, 7), (months.get(d.date.slice(0, 7)) ?? 0) + d.count);
  const lastActive = [...days].reverse().find((d) => d.count > 0)?.date;
  return {
    hasCalendar: days.length > 0,
    currentStreak: current,
    longestStreak: longest,
    activeDays: days.filter((d) => d.count > 0).length,
    totalDays: days.length,
    weekly,
    daily: days.slice(-30).map((d) => d.count),
    monthly: [...months.values()].slice(-12),
    daysSinceActive: lastActive ? Math.floor((now - new Date(`${lastActive}T00:00:00Z`)) / 864e5) : Infinity,
    years: (now - new Date(profile.createdAt ?? '2016-02-28')) / (365.25 * 864e5),
  };
}

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Vue: '#41b883', HTML: '#e34c26', CSS: '#663399',
  Go: '#00ADD8', R: '#198CE7', Shell: '#89e051', PHP: '#4F5D95', Java: '#b07219', 'C#': '#178600', C: '#555555',
  'C++': '#f34b7d', SCSS: '#c6538c', Dart: '#00B4AB', Kotlin: '#A97BFF', Swift: '#F05138', Rust: '#dea584',
};
