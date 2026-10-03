// Fetches everything the live cards need from the GitHub GraphQL API and
// reduces it to plain numbers.
const API = 'https://api.github.com/graphql';

async function gql(token, query, variables) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-cards' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GitHub API: ${JSON.stringify(json.errors)}`);
  return json.data;
}

const USER_QUERY = `query($login: String!) {
  user(login: $login) {
    login name createdAt
    followers { totalCount }
    pullRequests { totalCount }
    issues { totalCount }
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount }
    contributionsCollection {
      totalCommitContributions
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }
  }
}`;

const REPOS_QUERY = `query($login: String!, $after: String) {
  user(login: $login) {
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
      pageInfo { hasNextPage endCursor }
      nodes {
        stargazerCount forkCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } }
      }
    }
  }
}`;

const REPO_FIELDS = 'name description url stargazerCount forkCount pushedAt primaryLanguage { name color }';

export async function fetchProfile({ token, login, featured, hiddenLanguages = [] }) {
  const { user } = await gql(token, USER_QUERY, { login });

  const repos = [];
  for (let after = null; ; ) {
    const page = (await gql(token, REPOS_QUERY, { login, after })).user.repositories;
    repos.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) break;
    after = page.pageInfo.endCursor;
  }

  const sizes = new Map();
  for (const repo of repos) {
    for (const { size, node } of repo.languages.edges) {
      if (hiddenLanguages.includes(node.name)) continue;
      const cur = sizes.get(node.name) ?? { name: node.name, color: node.color ?? '#8b949e', size: 0 };
      cur.size += size;
      sizes.set(node.name, cur);
    }
  }

  let featuredRepos = [];
  if (featured.length) {
    const query = `query($login: String!) {${featured
      .map((name, i) => `r${i}: repository(owner: $login, name: ${JSON.stringify(name)}) { ${REPO_FIELDS} }`)
      .join('\n')}}`;
    const data = await gql(token, query, { login });
    featuredRepos = featured.map((_, i) => data[`r${i}`]).filter(Boolean).map((r) => ({
      name: r.name,
      description: r.description ?? '',
      url: r.url,
      stars: r.stargazerCount,
      forks: r.forkCount,
      pushedAt: r.pushedAt,
      language: r.primaryLanguage,
    }));
  }

  const cc = user.contributionsCollection;
  return {
    login: user.login,
    name: user.name ?? user.login,
    createdAt: user.createdAt,
    followers: user.followers.totalCount,
    pullRequests: user.pullRequests.totalCount,
    issues: user.issues.totalCount,
    publicRepos: user.repositories.totalCount,
    stars: repos.reduce((n, r) => n + r.stargazerCount, 0),
    forks: repos.reduce((n, r) => n + r.forkCount, 0),
    commitsYear: cc.totalCommitContributions,
    contributionsYear: cc.contributionCalendar.totalContributions,
    calendar: cc.contributionCalendar.weeks.flatMap((w) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))),
    languages: [...sizes.values()].sort((a, b) => b.size - a.size),
    featured: featuredRepos,
  };
}

// Streaks, active days and the weekly/monthly series drawn by the dashboard.
export function deriveStats(profile, now = new Date()) {
  const days = [...profile.calendar].sort((a, b) => a.date.localeCompare(b.date)).slice(-365);
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--; // today is not over yet
  let current = 0;
  for (; i >= 0 && days[i].count > 0; i--) current++;

  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  const active = days.filter((d) => d.count > 0).length;
  const lastActive = [...days].reverse().find((d) => d.count > 0)?.date ?? null;

  const weekly = [];
  for (let w = 0; w < days.length; w += 7) weekly.push(days.slice(w, w + 7).reduce((n, d) => n + d.count, 0));

  const months = new Map();
  for (const d of days) months.set(d.date.slice(0, 7), (months.get(d.date.slice(0, 7)) ?? 0) + d.count);
  const monthly = [...months.values()].slice(-12);

  const daysSinceActive = lastActive ? Math.floor((now - new Date(`${lastActive}T00:00:00Z`)) / 864e5) : Infinity;
  const years = (now - new Date(profile.createdAt)) / (365.25 * 864e5);

  return {
    currentStreak: current,
    longestStreak: longest,
    activeDays: active,
    totalDays: days.length,
    weekly,
    daily: days.slice(-30).map((d) => d.count),
    monthly,
    daysSinceActive,
    years,
  };
}
